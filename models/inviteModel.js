import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: { type: String, required: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, default: Date.now, expires: "7d" },
}, { timestamps: true });

inviteSchema.index({ token: 1 });
inviteSchema.index({ email: 1 }); // Add index for email for faster lookups
inviteSchema.index({ invitedBy: 1 }); // Add index for invitedBy for faster lookups

export default mongoose.model("Invite", inviteSchema);
