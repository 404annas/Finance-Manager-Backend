import mongoose from "mongoose";

const schedulePaymentSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    scheduledFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "done"],
        default: "pending",
    },
}, {
    timestamps: true
});

schedulePaymentSchema.index({ status: 1, scheduledDate: 1 });
schedulePaymentSchema.index({ createdBy: 1 });
schedulePaymentSchema.index({ scheduledFor: 1 });

const SchedulePayment = new mongoose.model("SchedulePayment", schedulePaymentSchema);
export default SchedulePayment;