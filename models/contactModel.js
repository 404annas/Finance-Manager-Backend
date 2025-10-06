import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    type: {
        type: String,
        enum: ["support", "recommendation", "bug", "feature", "general"],
        required: true
    },
    message: { type: String, required: true },
}, { timestamps: true });

contactSchema.index({ type: 1 });

const Contact = new mongoose.model("Contact", contactSchema);

export default Contact;