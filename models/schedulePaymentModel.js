import mongoose from "mongoose";

const schedulePaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
},
    { timestamps: true });

const SchedulePayment = new mongoose.model("SchedulePayment", schedulePaymentSchema);

export default SchedulePayment;