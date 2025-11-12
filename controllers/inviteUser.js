import Invite from "../models/inviteModel.js";
import User from "../models/userModel.js";
import ConnectionRequest from "../models/connectionRequestModel.js";
import jwt from "jsonwebtoken";
import { sendInviteEmail, sendConnectionRequestEmail } from "../config/mailer.js";

export const inviteUser = async (req, res) => {
    try {
        const { emails } = req.body;
        const requester = req.user;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: "Emails are required" });
        }

        const results = [];

        for (const email of emails) {
            const recipient = await User.findOne({ email });

            if (recipient) {
                if (recipient._id.equals(requester._id)) {
                    results.push({ email, status: "❌ Aap khud ko invite nahi kar sakte" });
                    continue;
                }

                // Check karein kya pehle se connected hain? (Purane logic se)
                const isAlreadyConnected = requester.invitedUsers.some(userId => userId.equals(recipient._id))
                    || recipient.invitedUsers.some(userId => userId.equals(requester._id));

                if (isAlreadyConnected) {
                    results.push({ email, status: "🤝 Pehle se connected hain" });
                    continue;
                }

                // Check karein kya pending request mojood hai?
                const existingRequest = await ConnectionRequest.findOne({
                    requester: requester._id,
                    recipient: recipient._id,
                    status: "pending"
                });

                if (existingRequest) {
                    results.push({ email, status: "⏳ Request pehle se pending hai" });
                    continue;
                }

                // Nayi connection request banayein
                await ConnectionRequest.create({
                    requester: requester._id,
                    recipient: recipient._id,
                });

                // User ko connection request ka email bhejein
                await sendConnectionRequestEmail(email, requester.name);
                results.push({ email, status: "✅ Connection request bhej di gayi hai" });

            } else {
                const rawJwtToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

                await Invite.findOneAndUpdate(
                    { email, invitedBy: requester._id },
                    { token: rawJwtToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                    { upsert: true, new: true }
                );

                const fullInviteLink = `https://finance-manage-kappa.vercel.app/register?token=${rawJwtToken}`;
                await sendInviteEmail(email, fullInviteLink);
                results.push({ email, status: "✅ Naye user ko invite bhej diya hai" });
            }
        }

        res.json({ message: "Process completed", results });
    } catch (error) {
        console.error("❌ Invite error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};