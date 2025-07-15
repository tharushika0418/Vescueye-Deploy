require("dotenv").config();
const nodemailer = require("nodemailer");

// Configure Nodemailer with Outlook SMTP
const transporter = nodemailer.createTransporter({
  host: "smtp.office365.com", 
  port: 587, 
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP connection successful');
  }
});

// Function to send password reset email
const sendPasswordResetEmail = async (to, resetToken, userFirstName = '') => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello ${userFirstName ? userFirstName : ''},</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(to, 'Password Reset Request', htmlContent);
};

// Generic function to send an email
const sendEmail = async (to, subject, html) => {
  try { // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email format');
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { 
      success: true, 
      message: "Email sent successfully",
      messageId: info.messageId 
    };
  } catch (error) {
    console.error("Error sending email:", error);
    let errorMessage = "Email sending failed";
    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Unable to connect to email server";
    } else if (error.message.includes('Invalid email')) {
      errorMessage = "Invalid email address";
    }
    
    return { 
      success: false, 
      message: errorMessage, 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    };
  }
};

module.exports = { sendEmail, sendPasswordResetEmail };