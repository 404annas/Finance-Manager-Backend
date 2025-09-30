import sendReminderEmail from "../config/reminderMailer.js";

const sendReminder = async (req, res) => {
    const { subject, email, amount, currency, message } = req.body;

    if (!subject, !email || !amount || !currency) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sendReminderEmail({ subject, email, amount, currency, message });
        res.status(200).json({ success: true, message: "Reminder sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send reminder" });
    }
}

export default sendReminder;