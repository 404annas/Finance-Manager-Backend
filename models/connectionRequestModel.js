import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    },
}, { timestamps: true });

const ConnectionRequest = new mongoose.model("ConnectionRequest", connectionRequestSchema)

export default ConnectionRequest;