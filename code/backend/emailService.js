require("dotenv").config();
const nodemailer = require("nodemailer");

// Function to send an email
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Use an App Password if 2FA is enabled
    },
    tls: {
      rejectUnauthorized: false, // optional, can help in some environments
    },
  });

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: "Email sending failed", error };
  }
};

module.exports = { sendEmail };
