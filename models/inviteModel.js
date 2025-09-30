import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, default: Date.now, expires: "7d" },
}, { timestamps: true });

export default mongoose.model("Invite", inviteSchema);
