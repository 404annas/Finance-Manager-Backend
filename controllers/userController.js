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
            let decodedToken;
            try {
                decodedToken = jwt.verify(inviteToken, process.env.JWT_SECRET);
            } catch (jwtError) {
                return res.status(400).json({ message: "This invitation link is invalid or has expired." });
            }

            if (decodedToken.email.toLowerCase() !== email.toLowerCase()) {
                return res.status(400).json({ message: "This invitation is not for this email address." });
            }

            const invite = await Invite.findOne({ token: inviteToken });
            if (!invite) {
                return res.status(400).json({ message: "This invitation has already been used or is no longer valid." });
            }

            status = "accepted";
            invitedById = invite.invitedBy;
            inviter = await User.findById(invitedById);
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: profileImagePath,
            status,
            invitedBy: invitedById,
        });

        if (user && inviter) {
            if (!inviter.invitedUsers) {
                inviter.invitedUsers = [];
            }
            inviter.invitedUsers.push(user._id);
            await inviter.save();
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