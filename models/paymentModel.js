import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    shareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Share",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    category: { type: String, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    image: { type: String, default: null },
}, { timestamps: true });

const Payment = new mongoose.model("Payment", paymentSchema);

export default Payment;