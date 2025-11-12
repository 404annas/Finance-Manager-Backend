import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, token: inviteToken } = req.body;
        const profileImagePath = req.file ? req.file.path : null;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let status = "pending";
        let invitedById = null;
        let inviter = null;

        if (inviteToken) {
            const invite = await Invite.findOne({ token: inviteToken });

            if (!invite) {
                return res.status(400).json({ message: "This invitation link is invalid or has expired." });
            }

            if (invite.email.toLowerCase() !== email.toLowerCase()) {
                return res.status(400).json({ message: "This invitation is not for this email address." });
            }

            status = "accepted";
            invitedById = invite.invitedBy;
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: profileImagePath,
            status,
            invitedBy: invitedById,
        });

        if (user && invitedById) {
            await User.findByIdAndUpdate(invitedById, {
                $addToSet: { invitedUsers: user._id }
            });

            await Invite.deleteOne({ token: inviteToken });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: "Welcome to FinSync Dashboard 🎉",
            html: `<h2>Hello ${user.name},</h2><p>Your account has been created successfully.</p><p>Best regards,<br/>FinSync Dashboard Team</p>`,
        });

        const authToken = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token: authToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                status: user.status
            },
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

        // --- CORRECTED TOKEN CREATION ---
        const token = jwt.sign(
            { _id: user._id, email: user.email }, // Use `_id` to match the middleware
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                status: user.status
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = req.body.name || user.name;
        if (req.file) {
            user.profileImage = req.file.path;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserDashboard = (req, res) => {
    res.json({
        message: "Welcome to Dashboard",
        user: req.user,
    });
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found with this email" });
        }

        // Generate reset token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenExpires = Date.now() + 3600000; // 1 hour

        // Save reset token and expiry in user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email with reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: "Password Reset Request",
            html: `<h2>Hello ${user.name},</h2>
                   <p>You have requested to reset your password.</p>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #6667DD; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
                   <p>This link will expire in 1 hour.</p>
                   <p>If you did not request this, please ignore this email.</p>
                   <p>Best regards,<br/>FinSync Dashboard Team</p>`,
        });

        res.status(200).json({
            message: "Password reset link has been sent to your email",
            resetToken
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ message: "Server error during forgot password process" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ message: "Server error during password reset" });
    }
};