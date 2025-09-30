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