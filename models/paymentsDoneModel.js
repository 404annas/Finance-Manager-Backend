import mongoose from "mongoose";

const paymentsDoneSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    message: { type: String, trim: true },
},
    { timestamps: true }
);

paymentsDoneSchema.index({ userId: 1 });

const PaymentsDone = new mongoose.model("PaymentsDone", paymentsDoneSchema);

export default PaymentsDone;