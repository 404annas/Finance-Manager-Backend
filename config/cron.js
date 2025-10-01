import cron from "node-cron";
import nodemailer from "nodemailer";
import SchedulePayment from "../models/schedulePaymentModel.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER, // tumhara email
        pass: process.env.SMTP_PASS, // app password
    },
});

// Schedule a task to run every minute
cron.schedule("* * * * *", async () => {
    const now = new Date();
    // console.log("Cron running at", new Date().toLocaleString());

    try {
        const payments = await SchedulePayment.find({
            status: "pending",
            scheduledDate: { $lte: now },
        });
        // console.log("Pending payments:", payments);

        for (let payment of payments) {
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.SMTP_USER, // khud ko email
                subject: `Scheduled Payment Reminder: ${payment.title || "No Title"}`,
                html: `
    <div style="font-family: Rockwell, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #6667DD;">Scheduled Payment Reminder</h2>
      <p><strong>Title:</strong> ${payment.title || "No Title"}</p>
      <p><strong>Date & Time:</strong> ${payment.scheduledDate.toLocaleString()}</p>
      <p><strong>Message:</strong> ${payment.message || "No message"}</p>
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
      <p style="font-size: 0.9rem; color:#555;">This is an automated payment reminder. Please do not reply to this email.</p>
    </div>
  `
            });

            payment.status = "done";
            await payment.save();
            console.log(`Payment "${payment.title}" marked as done and email sent.`);
        }
    } catch (err) {
        console.error("Cron job error:", err);
    }
})