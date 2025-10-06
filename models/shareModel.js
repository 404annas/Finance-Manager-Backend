import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    // The user who created this shared payment
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // An array of users this was shared with
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }]
}, { timestamps: true });

shareSchema.index({ sharedBy: 1 });
shareSchema.index({ sharedWith: 1 });

const Share = new mongoose.model("Share", shareSchema);

export default Share;