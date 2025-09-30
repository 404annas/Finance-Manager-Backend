import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: {
        type: String,
        enum: ["support", "recommendation", "bug", "feature", "general"],
        required: true
    },
    message: { type: String, required: true },
}, { timestamps: true });

const Contact = new mongoose.model("Contact", contactSchema);

export default Contact;