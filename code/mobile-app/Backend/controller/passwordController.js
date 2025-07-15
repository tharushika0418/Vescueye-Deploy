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
      <p>Hello,</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
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
    
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};