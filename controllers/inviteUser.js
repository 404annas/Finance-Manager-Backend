import Invite from "../models/inviteModel.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { sendInviteEmail } from "../config/mailer.js";

export const inviteUser = async (req, res) => {
    try {
        const { emails } = req.body; // 👈 ab array aayegi

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: "Emails are required" });
        }

        const results = [];

        for (const email of emails) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                results.push({ email, status: "❌ Already registered" });
                continue;
            }

            const rawJwtToken = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });

            await Invite.create({
                invitedBy: req.user._id,
                email,
                token: rawJwtToken,
            });

            const fullInviteLink = `http://localhost:5174/register?token=${rawJwtToken}`;
            await sendInviteEmail(email, fullInviteLink);

            results.push({ email, status: "✅ Invite sent" });
        }

        res.json({ message: "Process completed", results });
    } catch (error) {
        console.error("❌ Invite error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
