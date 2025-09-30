import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, token } = req.body; // 'token' will now be present if sent from client
        console.log("Token received in registerUser backend:", token);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = req.file ? req.file.path : null;

        let status = "pending"; // Default status

        if (token) {
            // Verify the token to ensure it's valid and matches the email
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                console.log("Decoded Token:", decodedToken);
                if (decodedToken.email !== email) {
                    return res.status(400).json({ message: "Invalid invite token for this email." });
                }
            } catch (jwtError) {
                console.error("JWT Verification Error:", jwtError);
                return res.status(400).json({ message: "Invalid or expired invite token." });
            }

            const invite = await Invite.findOne({ token, email }); // Find the invite by token and email
            if (invite) {
                status = "accepted"; // Update status to accepted
            } else {
                console.warn(`Invite not found for email: ${email} with token: ${token}`);
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "user", // Default role to 'user' if not specified
            profileImage,
            status, // Set the status based on invite acceptance
        });

        // ✅ Send welcome email after successful registration
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

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Error registering user:", error); // Use console.error for errors
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return (res.status(400).json({ message: "Invalid Email or Password" }))
        }
        console.log(user);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return (res.status(400).json({ message: "Invalid Email or Password" }))
        }
        console.log(isMatch);

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        console.log(token)

        res.status(200).json({
            message: "Login successfull",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage || null, },
        })
        console.log(user);

    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
        console.log(error.message);
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.status(200).json({ message: "Logout successful" });
        console.log("Logged Out")
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
        console.log(error.message)
    }
}

export const getUserDashboard = (req, res) => {
    res.json({
        message: "Welcome to User Dashboard",
        user: req.user,
    });
};

export const getAdminDashboard = (req, res) => {
    res.json({
        message: "Welcome to Admin Dashboard",
        admin: req.user,
    });
};