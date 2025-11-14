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
                    results.push({ email, status: "❌ You cannot invite yourself" });
                    continue;
                }

                // Check karein kya pehle se connected hain? (Purane logic se)
                const isAlreadyConnected = requester.invitedUsers.some(userId => userId.equals(recipient._id))
                    || recipient.invitedUsers.some(userId => userId.equals(requester._id));

                if (isAlreadyConnected) {
                    results.push({ email, status: "🤝 Already connected" });
                    continue;
                }

                // Check karein kya pending request mojood hai?
                const existingRequest = await ConnectionRequest.findOne({
                    requester: requester._id,
                    recipient: recipient._id,
                    status: "pending"
                });

                if (existingRequest) {
                    results.push({ email, status: "⏳ Request already pending" });
                    continue;
                }

                // Nayi connection request banayein
                await ConnectionRequest.create({
                    requester: requester._id,
                    recipient: recipient._id,
                });

                // User ko connection request ka email bhejein
                await sendConnectionRequestEmail(email, requester.name);
                results.push({ email, status: "✅ Connection request sent successfully" });

            } else {
                const rawJwtToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

                await Invite.findOneAndUpdate(
                    { email, invitedBy: requester._id },
                    { token: rawJwtToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                    { upsert: true, new: true }
                );

                const fullInviteLink = `https://finance-manage-kappa.vercel.app/register?token=${rawJwtToken}`;
                await sendInviteEmail(email, fullInviteLink);
                results.push({ email, status: "✅ Invitation sent to new user" });
            }
        }

        res.json({ message: "Process completed", results });
    } catch (error) {
        console.error("❌ Invite error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPendingInvites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const query = { invitedBy: req.user._id };

        const totalInvites = await Invite.countDocuments(query);
        const invites = await Invite.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const pendingInviteUsers = invites.map(invite => ({
            _id: invite._id,
            name: 'Invited User',
            email: invite.email,
            profileImage: 'https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500',
            connectionStatus: 'Pending (Unregistered)'
        }));

        res.status(200).json({
            invites: pendingInviteUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalInvites / limit),
                totalInvites: totalInvites
            }
        });
    } catch (error) {
        console.error("Error fetching pending invites:", error);
        res.status(500).json({ message: "Failed to fetch pending invites." });
    }
};

export const deletePendingInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        const invite = await Invite.findOne({ _id: inviteId, invitedBy: req.user._id });

        if (!invite) {
            return res.status(404).json({ message: "Invite not found or you don't have permission to delete it." });
        }

        await Invite.deleteOne({ _id: inviteId });
        res.status(200).json({ message: "Invitation has been cancelled." });
    } catch (error) {
        res.status(500).json({ message: "Failed to cancel invitation." });
    }
};