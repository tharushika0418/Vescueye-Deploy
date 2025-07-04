require("dotenv").config();
const nodemailer = require("nodemailer");

// Configure Nodemailer with Outlook SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", 
  port: 587, 
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html, // Send HTML content instead of plain text
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
