import Share from "../models/shareModel.js";
import User from "../models/userModel.js";
import { sendShareNotificationEmail } from "../config/mailer.js";
import Notification from "../models/notification.js";

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
            // 2. Prepare notification details
            const notificationMessage = `${req.user.name} shared a payment card "${title}" with you.`;
            const notificationLink = `/recipient/${newShare._id}`;

            // 3. Get recipient details for both emails and real-time notifications
            const recipients = await User.find({ '_id': { $in: sharedWith } }).select("name email _id");

            // 4. Loop through each recipient
            for (const recipient of recipients) {
                // A. Send Email (Your existing logic)
                // It's good practice to await this to ensure emails are sent,
                // but you could also fire-and-forget if speed is critical.
                await sendShareNotificationEmail(
                    recipient.email,
                    req.user.name,
                    title,
                    category
                );

                // B. Create persistent notification in MongoDB
                const notification = await Notification.create({
                    user: recipient._id, // The ID of the user receiving the notification
                    message: notificationMessage,
                    link: notificationLink,
                });

                // C. Emit real-time event via Socket.IO
                // Send to the specific room for this user ID
                req.io.to(recipient._id.toString()).emit("new_notification", notification);
            }

        } catch (notifyError) {
            // Log error but don't fail the main request if notifications fail
            console.error("Error sending notifications (email or socket):", notifyError);
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
            .sort({ createdAt: -1 })
            .lean();

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