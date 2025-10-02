import Share from "../models/shareModel.js";
import User from "../models/userModel.js";
import { sendShareNotificationEmail } from "../config/mailer.js";

export const createShare = async (req, res) => {
    try {
        const { title, category, sharedWith } = req.body; // sharedWith will be an array of user IDs

        if (!title || !category || !sharedWith || sharedWith.length === 0) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const newShare = await Share.create({
            title,
            category,
            sharedWith,
            sharedBy: req.user._id // From authMiddleware
        });

        // After successfully creating the share, send notifications.
        try {
            // Find the full user documents of the recipients to get their emails
            const recipients = await User.find({ '_id': { $in: sharedWith } }).select("name email");

            // Loop through each recipient and send them an email
            for (const recipient of recipients) {
                await sendShareNotificationEmail(
                    recipient.email,
                    req.user.name, // The name of the user who is sharing
                    title,
                    category
                );
            }
        } catch (emailError) {
            console.error("Could not send share notification emails:", emailError);
        }

        res.status(201).json({ message: "Payment shared successfully", share: newShare });

    } catch (error) {
        console.error("Error creating share:", error);
        res.status(500).json({ message: "Server error while creating share." });
    }
};

export const getMyShares = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find shares WHERE:
        // - the user is the creator (sharedBy)
        // - OR the user's ID is in the sharedWith array
        const shares = await Share.find({
            $or: [{ sharedBy: userId }, { sharedWith: userId }]
        })
            .populate("sharedBy", "name email") // Get the creator's info
            .populate("sharedWith", "name email") // Get info of all people it's shared with
            .sort({ createdAt: -1 });

        res.status(200).json({ shares });

    } catch (error) {
        console.error("Error fetching shares:", error);
        res.status(500).json({ message: "Server error while fetching shares." });
    }
};

export const getShareRecipients = async (req, res) => {
    try {
        const recipients = await User.find({ invitedBy: req.user._id });
        res.status(200).json({ recipients });
    } catch (error) {
        console.error("Error fetching recipients:", error);
        res.status(500).json({ message: "Server error while fetching recipients." });
    }
};

export const deleteShare = async (req, res) => {
    try {
        const share = await Share.findById(req.params.id);

        // Check if the share exists
        if (!share) {
            return res.status(404).json({ message: "Shared payment not found." });
        }

        // SECURITY CHECK: Ensure the user deleting the share is the one who created it
        if (share.sharedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this item." });
        }

        await share.deleteOne(); // Mongoose v6+ uses deleteOne()

        res.status(200).json({ message: "Shared payment deleted successfully." });

    } catch (error) {
        console.error("Error deleting share:", error);
        res.status(500).json({ message: "Server error while deleting share." });
    }
};