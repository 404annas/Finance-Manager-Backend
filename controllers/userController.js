import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, token: inviteToken } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = req.file ? req.file.path : null;

        let status = "pending";
        let invitedById = null; // <-- FIX: Prepare a variable to hold the inviter's ID.

        if (inviteToken) {
            let decodedToken;
            try {
                decodedToken = jwt.verify(inviteToken, process.env.JWT_SECRET);
                if (decodedToken.email !== email) {
                    return res.status(400).json({ message: "Invalid invite token for this email." });
                }
            } catch (jwtError) {
                return res.status(400).json({ message: "Invalid or expired invite token." });
            }

            const invite = await Invite.findOne({ token: inviteToken, email });
            if (invite) {
                status = "accepted";
                invitedById = invite.invitedBy; // <-- FIX: Get the ID from the invite document.
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage,
            status,
            invitedBy: invitedById, // <-- FIX: Save the inviter's ID when creating the new user.
        });

        // ... (Send welcome email code remains the same)
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
            subject: "Welcome to Finance Dashboard 🎉",
            html: `<h2>Hello ${user.name},</h2>
                   <p>Your account has been created successfully.</p>
                   <p>Login with your email: <b>${user.email}</b></p>
                   <br />
                   <p>Best regards,<br/>Finance Dashboard Team</p>`,
        });

        // This declaration is now valid because 'token' hasn't been used before in this scope
        const authToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage || null,
                status: user.status
            },
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

        const token = jwt.sign(
            { id: user._id, email: user.email }, // id aur email dono include
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage || null,
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

export const getUserDashboard = (req, res) => {
    res.json({
        message: "Welcome to Dashboard",
        user: req.user,
    });
};