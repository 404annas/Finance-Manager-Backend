import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, default: Date.now, expires: "7d" },
}, { timestamps: true });

inviteSchema.index({ email: 1 });
inviteSchema.index({ token: 1 });

export default mongoose.model("Invite", inviteSchema);
