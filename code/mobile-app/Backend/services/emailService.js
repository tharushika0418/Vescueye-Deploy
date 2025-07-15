require("dotenv").config();
const nodemailer = require("nodemailer");

// Debug environment variables
console.log("📧 Email config check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET (16 chars)" : "NOT SET");

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail app password
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/**
 * Send email with both HTML and plain text content
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 * @param {string} text - Plain text email content (fallback)
 */
const sendEmail = async (to, subject, html, text) => {
  console.log(`📧 Attempting to send email to: ${to}`);

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text, // Plain text fallback
      html, // HTML content
    };

    console.log("Mail options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, message: "Email sent successfully", messageId: info.messageId };
  } catch (error) {
    console.error("❌ Detailed email error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });

    return {
      success: false,
      message: "Email sending failed",
      error: error.message,
      details: error,
    };
  }
};

module.exports = { sendEmail };
