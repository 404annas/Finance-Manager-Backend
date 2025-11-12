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

export const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const recipientId = req.user._id;

        const request = await ConnectionRequest.findById(requestId);

        if (!request || !request.recipient.equals(recipientId) || request.status !== 'pending') {
            return res.status(404).json({ message: "Request nahi mili ya pehle hi handle ho chuki hai." });
        }

        // 1. Requester ki `invitedUsers` array update karein
        await User.findByIdAndUpdate(request.requester, {
            $addToSet: { invitedUsers: recipientId }
        });

        // 2. Recipient ki `invitedUsers` array update karein
        await User.findByIdAndUpdate(recipientId, {
            $addToSet: { invitedUsers: request.requester }
        });

        // Agar recipient ka `invitedBy` khali hai to set karein (optional, par acha hai)
        await User.updateOne(
            { _id: recipientId, invitedBy: null },
            { $set: { invitedBy: request.requester } }
        );

        // 3. Request ka status 'accepted' karein
        request.status = "accepted";
        await request.save();

        res.status(200).json({ message: "Connection successful!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}
