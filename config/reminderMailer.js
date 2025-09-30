import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendReminderEmail = async ({ subject, email, amount, currency, message }) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "💳 Payment Reminder",
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
            <table role="presentation" style="width:100%; max-width:600px; background:#E9D4FF; border-radius:12px; padding:20px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
              <tr>
                <td style="text-align:center;">
                  
                  <h2 style="color:#2c3e50; margin:0 0 15px;">Payment Reminder</h2>
                  <h3 style="color:#333; margin:0 0 20px;">Title: ${subject}</h3>
                  
                  <p style="font-size:16px; color:#555; margin:0 0 15px;">
                    You have a pending payment:
                  </p>

                  <!-- Amount Box -->
                  <table role="presentation" style="width:100%; background:#f1f5f9; border-radius:8px; margin:15px 0; padding:10px;">
                    <tr>
                      <td style="text-align:center;">
                        <p style="margin:0; font-size:20px; font-weight:bold; color:#111;">
                          ${currency} ${amount}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:15px; color:#444; line-height:1.6; margin:15px 0;">
                    Message: ${message}
                  </p>

                  <!-- CTA Button -->
                  <a href="#" style="display:inline-block; margin:20px 0; padding:12px 20px; background:#6667DD; color:#fff; font-size:16px; font-weight:bold; text-decoration:none; border-radius:8px;">
                    Pay Now
                  </a>

                  <p style="font-size:12px; color:#888; margin-top:25px;">
                    This is an automated payment reminder. Please ignore if already paid.
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
    `,
    };
    return transporter.sendMail(mailOptions);
};

export default sendReminderEmail;
