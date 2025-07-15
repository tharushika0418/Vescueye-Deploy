const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expireTime = Date.now() + 3600000; // 1 hour

    // Update reset token fields and skip validation on save
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expireTime;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.LOCALHOST}/api/auth/reset-password/${token}`;
    
const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #333;">Password Reset Request</h2>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
        <strong>For Mobile App:</strong>
      </p>
      <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
        Copy this token and paste it in your mobile app:
      </p>
      <div style="background-color: #fff; padding: 15px; border: 2px dashed #007bff; border-radius: 5px; text-align: center;">
        <code style="font-size: 16px; font-weight: bold; color: #007bff; word-break: break-all;">
          ${token}
        </code>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
        <strong>For Web:</strong>
      </p>
      <a href="${process.env.LOCALHOST}/api/auth/reset-password/${token}" 
         style="display: inline-block; padding: 12px 30px; font-size: 16px; 
                color: white; background-color: #007bff; text-decoration: none; 
                border-radius: 5px; font-weight: bold;">
        Reset Password
      </a>
    </div>

    <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center;">
      <p style="color: #6c757d; font-size: 14px;">
        This token expires in 1 hour. If you didn't request this, ignore this email.
      </p>
    </div>
  </div>
`;

    const result = await sendEmail(user.email, 'Password Reset Request', html);

    if (result.success) {
      return res.status(200).json({ message: 'Reset link sent to your email.' });
    } else {
      return res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  
  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Skip validation to avoid full_name required error
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};