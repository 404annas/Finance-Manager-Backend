import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    currency: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    imageUrl: { type: String },
}, { timestamps: true });

const Transaction = new mongoose.model("Transaction", transactionSchema);

export default Transaction;