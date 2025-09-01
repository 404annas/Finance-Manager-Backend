import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendInviteEmail(to, inviteLink) {
    const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>You’re invited to join ${process.env.APP_NAME}</h2>
      <p>Click the button below to accept the invitation:</p>
      <p><a href="${inviteLink}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#6667DD;color:#fff;text-decoration:none;">Accept Invite</a></p>
      <p>Or open this link: <br/> ${inviteLink}</p>
      <p>This link expires in ${process.env.INVITE_EXPIRY_DAYS || 7} days.</p>
    </div>
  `;

    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject: `Invitation to join ${process.env.APP_NAME}`,
        html,
    });

    console.log("Invite email sent to:", to);
}
