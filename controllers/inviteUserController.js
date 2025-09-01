// controllers/inviteUserController.js
import crypto from "crypto";
import nodemailer from "nodemailer";
import Invite from "../models/userInviteModel.js";

export const sendInvite = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 1. Generate a random token
        const token = crypto.randomBytes(32).toString("hex");

        // 2. Hash it before saving
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // 3. Set expiration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.INVITE_EXPIRY_DAYS || 7));

        // 4. Save to DB
        const invite = new Invite({
            email,
            tokenHash,
            expiresAt,
            invitedBy: null, // later replace with logged-in user
        });

        await invite.save();

        // 5. Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true", // "true" → boolean
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 6. Prepare email
        const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}`;

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: `You're invited to ${process.env.APP_NAME}`,
            text: `You have been invited to join ${process.env.APP_NAME}. Use the link below:\n\n${inviteLink}\n\nThis link will expire in ${process.env.INVITE_EXPIRY_DAYS} days.`,
            html: `
        <h2>You are invited to ${process.env.APP_NAME}</h2>
        <p>Click the link below to accept your invite:</p>
        <a href="${inviteLink}" target="_blank">Accept Invite</a>
        <p>This link will expire in ${process.env.INVITE_EXPIRY_DAYS} days.</p>
      `,
        };

        // 7. Send email
        await transporter.sendMail(mailOptions);

        // 8. Response
        res.status(201).json({
            success: true,
            message: `Invite sent to ${email}`,
        });

        console.log(invite, email);

    } catch (error) {
        console.error("Error sending invite:", error);
        res.status(500).json({ success: false, message: "Server error while sending invite" });
    }
};
