import Payment from "../models/paymentModel.js";
import Share from "../models/shareModel.js";
import Notification from "../models/notification.js";

// Helper function for security check
const isUserInShare = (share, userId) => {
    const isOwner = share.sharedBy.toString() === userId.toString();
    const isMember = share.sharedWith.some(memberId => memberId.toString() === userId.toString());
    return isOwner || isMember;
};

export const addPayment = async (req, res) => {
    try {
        const { shareId } = req.params;
        const { title, category, currency, amount, status } = req.body;
        const imageUrl = req.file ? req.file.path : null;
        const currentUser = req.user;

        const share = await Share.findById(shareId);
        if (!share) {
            return res.status(404).json({ message: "Share not found." });
        }

        if (!isUserInShare(share, req.user._id)) {
            return res.status(403).json({ message: "Not authorized to add payments to this share." });
        }

        const newPayment = await Payment.create({
            shareId,
            createdBy: req.user._id,
            title, category, currency, amount, status,
            image: imageUrl,
        });

        const populatedPayment = await Payment.findById(newPayment._id).populate("createdBy", "name _id");

        try {
            // 2. Identify all members of the share
            const allMemberIds = [share.sharedBy._id, ...share.sharedWith.map(user => user._id)];

            // 3. Filter out the user who created the payment
            const recipients = allMemberIds.filter(
                memberId => memberId.toString() !== currentUser._id.toString()
            );

            // 4. If there are other members, send them notifications
            if (recipients.length > 0) {
                const notificationMessage = `${currentUser.name} added a new payment "${title}" to the "${share.title}" card.`;
                const notificationLink = `/recipient/${shareId}`;

                // Create a notification for each recipient
                for (const recipientId of recipients) {
                    const notification = await Notification.create({
                        user: recipientId,
                        message: notificationMessage,
                        link: notificationLink,
                    });

                    // Emit the event to that user's personal room
                    req.io.to(recipientId.toString()).emit("new_notification", notification);
                }
            }
        } catch (notifyError) {
            console.error("Error sending payment addition notifications:", notifyError);
            // We don't fail the whole request if notifications fail
        }

        res.status(201).json({ message: "Payment added successfully", payment: populatedPayment });

    } catch (error) {
        console.error("Error adding payment:", error)
        res.status(500).json({ message: "Server error while adding payment." });
    }
};

export const getPaymentsForShare = async (req, res) => {
    try {
        const { shareId } = req.params;
        const share = await Share.findById(shareId);
        if (!share) return res.status(404).json({ message: "Share not found." });

        // Security: Ensure user is part of the share to view its payments
        if (!isUserInShare(share, req.user._id)) {
            return res.status(403).json({ message: "Not authorized to view these payments." });
        }

        const payments = await Payment.find({ shareId }).populate("createdBy", "name _id").lean();
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
}

export const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: "Payment not found." });

        // Security: Only the user who created the payment can delete it
        if (payment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this payment." });
        }

        await payment.deleteOne();
        res.status(200).json({ message: "Payment deleted." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};