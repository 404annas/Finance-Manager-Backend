import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "used", "revoked"], default: "pending" },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
},
    { timestamps: true }
)

export default mongoose.model("Invite", inviteSchema);