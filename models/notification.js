import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

const Notification = new mongoose.model("Notification", notificationSchema);

export default Notification;