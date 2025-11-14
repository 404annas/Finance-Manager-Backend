import { sendConnectionRequestEmail } from "../config/mailer.js";
import ConnectionRequest from "../models/connectionRequestModel.js";
import User from "../models/userModel.js";

export const getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await ConnectionRequest.find({
            recipient: req.user._id,
            status: "pending"
        }).populate("requester", "name email profileImage");

        res.status(200).json(pendingRequests)
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending requests" });
    }
}

export const getSentRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const query = { requester: req.user._id, status: "pending" };

        const totalSent = await ConnectionRequest.countDocuments(query);
        const sentRequests = await ConnectionRequest.find(query)
            .populate("recipient", "name email profileImage")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            requests: sentRequests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalSent / limit),
                totalRequests: totalSent
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sent requests" });
    }
}

export const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const recipientId = req.user._id; // Yeh User C ki ID hai

        console.log(`--- acceptRequest Called ---`);
        console.log(`Request ID: ${requestId}`);
        console.log(`Recipient (User C) ID: ${recipientId}`);

        const request = await ConnectionRequest.findById(requestId);

        if (!request || !request.recipient.equals(recipientId) || request.status !== 'pending') {
            console.error("❌ Error: Request not found or already handled.");
            return res.status(404).json({ message: "Request not found or already handled." });
        }

        const requesterId = request.requester; // Yeh User B ki ID hai
        console.log(`Requester (User B) ID: ${requesterId}`);

        // --- DATABASE UPDATE ---
        console.log(`Updating User B (${requesterId}) to add User C (${recipientId})...`);
        const updatedRequester = await User.findByIdAndUpdate(requesterId, {
            $addToSet: { invitedUsers: recipientId }
        }, { new: true }); // { new: true } updated document return karega

        console.log(`Updating User C (${recipientId}) to add User B (${requesterId})...`);
        const updatedRecipient = await User.findByIdAndUpdate(recipientId, {
            $addToSet: { invitedUsers: requesterId }
        }, { new: true });

        console.log("✅ UPDATED Requester (User B):", updatedRequester.invitedUsers);
        console.log("✅ UPDATED Recipient (User C):", updatedRecipient.invitedUsers);

        // Request ka status update karein
        request.status = "accepted";
        await request.save();
        console.log("✅ Connection request status set to 'accepted'.");

        res.status(200).json({ message: "Connection successful!" });

    } catch (error) {
        console.error("❌ CRITICAL ERROR in acceptRequest:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const resendConnectionRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const requester = req.user;

        const recipient = await User.findOne({ email });

        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        // Find the existing pending request
        const existingRequest = await ConnectionRequest.findOne({
            requester: requester._id,
            recipient: recipient._id,
            status: 'pending',
        });

        if (!existingRequest) {
            return res.status(404).json({ message: "No pending connection request found to resend." });
        }

        // Simply re-send the email
        await sendConnectionRequestEmail(email, requester.name);

        res.status(200).json({ message: "Connection request has been resent." });

    } catch (error) {
        console.error("Error resending connection request:", error);
        res.status(500).json({ message: "Something went wrong." });
    }
};