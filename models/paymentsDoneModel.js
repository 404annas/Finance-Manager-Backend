import mongoose from "mongoose";

const paymentsDoneSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    message: { type: String },
},
    { timestamps: true }
);

const PaymentsDone = new mongoose.model("PaymentsDone", paymentsDoneSchema);

export default PaymentsDone;