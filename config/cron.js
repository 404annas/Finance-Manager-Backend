import cron from "node-cron";
import nodemailer from "nodemailer";
import SchedulePayment from "../models/schedulePaymentModel.js";

// Check if environment variables are loaded
if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL_ALIAS) {
    console.error("❌ CRON ERROR: SMTP environment variables (USER, PASS, or ALIAS) are not loaded.");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// console.log("✅ Cron job service initialized. Waiting for tasks...");

cron.schedule("* * * * *", async () => {
    // console.log(`\n🕒 Cron job running at: ${new Date().toLocaleString()}`);

    const nowUTC = new Date();
    // console.log(`   - Current UTC time for query: ${nowUTC.toISOString()}`);

    try {
        const payments = await SchedulePayment.find({
            status: "pending",
            scheduledDate: { $lte: nowUTC },
        }).populate([
            { path: 'createdBy', select: 'name email' },
            { path: 'scheduledFor', select: 'name email' }
        ]);

        // console.log(`   - Found ${payments.length} pending payments to process.`);

        if (payments.length === 0) {
            return;
        }

        for (let payment of payments) {
            console.log(`   - Processing payment ID: ${payment._id} for "${payment.title}"`);

            if (!payment.createdBy || !payment.scheduledFor) {
                console.log(`   - ⚠️ SKIPPING payment ${payment._id} due to missing user data.`);
                continue;
            }

            const creator = payment.createdBy;
            const recipient = payment.scheduledFor;
            const formattedScheduledDate = new Date(payment.scheduledDate).toLocaleString();

            // --- THE FIX IS HERE ---
            // We now use a special "From" address that includes the creator's name and our new plus-aliased email.
            // This ensures the From/To addresses are never identical, even when sending to yourself.
            const fromAddress = `"${creator.name} (via FinSync)" <${process.env.FROM_EMAIL_ALIAS}>`;

            console.log(`   - Attempting to send email from: ${fromAddress} to: ${recipient.email}`);

            await transporter.sendMail({
                from: fromAddress, // Use the new aliased "from" address
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

            console.log(`   - ✅ Email sent successfully for payment ID: ${payment._id}`);

            payment.status = "done";
            await payment.save();
            console.log(`   - ✅ Payment ID: ${payment._id} marked as 'done'.`);
        }
    } catch (err) {
        console.error("   - ❌ CRON JOB ERROR:", err);
    }
});