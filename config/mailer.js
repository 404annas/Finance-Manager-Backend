import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
});

export const sendInviteEmail = async (to, inviteLink) => { // This function now expects the full URL
  try {
    console.log("📧 Preparing invite for:", to);
    console.log("Full invite URL received by mailer:", inviteLink);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: "You're invited to Finance Dashboard 🎉",
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f9fc; font-family: Rockwell, sans-serif;">
    <table role="presentation" style="width:100%; border-collapse:collapse; background-color:#f6f9fc;">
      <tr>
        <td align="center" style="padding:20px;">
          
          <!-- Container -->
          <table role="presentation" style="width:100%; max-width:600px; background:#ffffff; border-radius:12px; padding:20px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <tr>
              <td style="text-align:center;">
                
                <h2 style="color:#2c3e50; margin:0 0 15px;">🎉 Welcome!</h2>
                
                <p style="font-size:16px; color:#555; margin:0 0 20px;">
                  You’ve been invited to join our <strong>Finance Dashboard</strong>.
                </p>

                <!-- CTA Button -->
                <a href="${inviteLink}" 
                   style="display:inline-block; margin:15px 0; padding:12px 24px; background:#6667DD; color:#fff; font-size:16px; font-weight:bold; text-decoration:none; border-radius:8px;">
                  Accept Invite
                </a>

                <p style="font-size:13px; color:#888; margin-top:20px; line-height:1.5;">
                  If the button above doesn’t work, copy and paste this link into your browser: <br/>
                  <a href="${inviteLink}" style="color:#6667DD; word-break:break-all;">${inviteLink}</a>
                </p>

              </td>
            </tr>
          </table>
          <!-- End Container -->

        </td>
      </tr>
    </table>
  </body>
</html>
`

    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

export const sendShareNotificationEmail = async (recipientEmail, sharerName, shareTitle, shareCategory) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: recipientEmail,
      subject: `💰 Payment Shared: You've been added to "${shareTitle}"`,
      html: `
  <div style="font-family: Rockwell, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; color: #333;">
    <h2 style="color: #6667DD; margin-bottom: 10px;">Hello,</h2>
    <p style="font-size: 16px; line-height: 1.5;">
      <b style="color: #111;">${sharerName}</b> has shared a payment with you on the <b>Finance Dashboard</b>.
    </p>

    <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <p style="margin: 0; font-weight: bold; color: #6667DD;">Payment Details:</p>
      <p style="margin: 5px 0;"><b>Title:</b> ${shareTitle}</p>
      <p style="margin: 5px 0;"><b>Category:</b> ${shareCategory}</p>
    </div>

    <p style="font-size: 14px; color: #555;">You can log in to your Dashboard to see more details.</p>
    
    <p style="margin-top: 20px; font-size: 14px; color: #555;">
      Best regards,<br/>
      <b style="color: #6667DD;">The Finance Dashboard Team</b>
    </p>
  </div>
`,
    });

    console.log(`Share notification sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending share notification to ${recipientEmail}:`, error);
  }
};

export const sendConnectionRequestEmail = async (to, requesterName) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: `🤝 ${requesterName} wants to connect on FinSync`,
      html: `
        <p>Hi there,</p>
        <p><b>${requesterName}</b> has sent you a connection request on FinSync.</p>
        <p>Please log in to your account to accept or decline this request from your dashboard.</p>
        <a href="https://finance-manage-kappa.vercel.app/login">Go to Dashboard</a>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Connection request email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending connection email:", error);
    throw error;
  }
};