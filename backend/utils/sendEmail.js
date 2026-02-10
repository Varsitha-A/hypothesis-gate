const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Mentor System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed:", err);
  }
};

module.exports = sendEmail;
