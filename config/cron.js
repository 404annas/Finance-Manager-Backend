import cron from "node-cron";
import nodemailer from "nodemailer";
import SchedulePayment from "../models/schedulePaymentModel.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// REMOVED the timezone option. This cron job now runs every minute based on the server's clock (which is UTC).
cron.schedule("* * * * *", async () => {
    // THE FIX: Use a simple `new Date()`. This gets the current time in UTC.
    const nowUTC = new Date();

    try {
        // The query now compares UTC with UTC, which is universally correct.
        const payments = await SchedulePayment.find({
            status: "pending",
            scheduledDate: { $lte: nowUTC },
        }).populate([
            { path: 'createdBy', select: 'name email' },
            { path: 'scheduledFor', select: 'name email' }
        ]);

        for (let payment of payments) {
            if (!payment.createdBy || !payment.scheduledFor) {
                console.log(`Skipping payment ${payment._id} due to missing user data.`);
                continue;
            }

            const creator = payment.createdBy;
            const recipient = payment.scheduledFor;

            // The 'from' address is formatted to show the creator's name.
            const fromAddress = `"${creator.name} (via FinSync)" <${process.env.SMTP_USER}>`;

            // We format the date in the email to be clear and readable.
            // Using `toLocaleString` without a specific timezone will often use the server's locale,
            // which is a reasonable default for an email.
            const formattedScheduledDate = new Date(payment.scheduledDate).toLocaleString();

            await transporter.sendMail({
                from: fromAddress,
                to: recipient.email,
                subject: `Payment Reminder: ${payment.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #6667DD;">Payment Reminder from ${creator.name}</h2>
                        <p>This is a scheduled reminder to make a payment.</p>
                        <p><strong>Title:</strong> ${payment.title}</p>
                        <p><strong>Scheduled For:</strong> ${formattedScheduledDate}</p>
                        <p><strong>Message from ${creator.name}:</strong></p>
                        <blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin-left: 0;">
                            <p>${payment.message || "No message provided."}</p>
                        </blockquote>
                        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
                        <p style="font-size: 0.9rem; color:#555;">This is an automated reminder sent from the FinSync application on behalf of ${creator.name}.</p>
                    </div>
                `
            });

            payment.status = "done";
            await payment.save();
            console.log(`Payment "${payment.title}" from ${creator.name} to ${recipient.name} marked as done and email sent.`);
        }
    } catch (err) {
        console.error("Cron job error:", err);
    }
});