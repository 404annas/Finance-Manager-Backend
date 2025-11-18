import cron from "node-cron";
import nodemailer from "nodemailer";
import SchedulePayment from "../models/schedulePaymentModel.js";

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL_ALIAS) { }

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

cron.schedule("*/5 * * * *", async () => {
    // console.log(`\n🕒 Cron job running at: ${new Date().toLocaleString()}`);

    const nowUTC = new Date();

    try {
        const payments = await SchedulePayment.find({
            status: "pending",
            scheduledDate: { $lte: nowUTC },
        }).populate([
            { path: 'createdBy', select: 'name email' },
            { path: 'scheduledFor', select: 'name email' }
        ]).lean();

        if (payments.length === 0) {
            return;
        }

        for (let payment of payments) {
            if (!payment.createdBy || !payment.scheduledFor) {
                continue;
            }

            const creator = payment.createdBy;
            const recipient = payment.scheduledFor;
            const formattedScheduledDate = new Date(payment.scheduledDate).toLocaleString();

            const fromAddress = `"${creator.name} (via Finantic)" <${process.env.FROM_EMAIL_ALIAS}>`;

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
                        <p style="font-size: 0.9rem; color:#555;">This is an automated reminder sent from the Finantic application on behalf of ${creator.name}.</p>
                    </div>
                `
            });

            console.log(`   - ✅ Email sent successfully for payment ID: ${payment._id}`);

            await SchedulePayment.updateOne(
                { _id: payment._id },
                { $set: { status: "done" } }
            );
        }
    } catch (err) {
        console.error("   - ❌ CRON JOB ERROR:", err);
    }
});