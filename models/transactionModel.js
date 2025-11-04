import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    currency: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true, default: null },
    imageUrl: { type: String, default: null },
}, { timestamps: true });

transactionSchema.index({ userId: 1 });

const Transaction = new mongoose.model("Transaction", transactionSchema);

export default Transaction;