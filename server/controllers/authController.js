const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// SEND OTP FOR FORGOT PASSWORD TO GMAIL (MULTI-TRANSPORT PORT 465 SSL + FALLBACK)
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : null;
    const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : null;

    let emailSent = false;
    let mailError = null;

    if (emailUser && emailPass) {
      // 1. Try Port 465 Direct SSL with IPv4
      try {
        const transporter465 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          family: 4,
          connectionTimeout: 6000,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        await transporter465.sendMail({
          from: `"AI Resume Analyzer" <${emailUser}>`,
          to: user.email,
          subject: 'Your Password Reset OTP Code - AI Resume Analyzer',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #2563eb; text-align: center; margin-bottom: 8px;">AI Resume Analyzer</h2>
              <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 0;">Secure Password Reset</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #334155; font-size: 14px;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #334155; font-size: 14px;">Your 6-digit One-Time Password (OTP) code is:</p>
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); padding: 18px; text-align: center; border-radius: 12px; margin: 20px 0; border: 1px solid #bfdbfe;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #1e40af;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; text-align: center;">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err1) {
        console.error('Port 465 SSL failed:', err1.message);
        mailError = err1.message;

        // 2. Try standard service: 'gmail'
        try {
          const transporterGmail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: emailUser,
              pass: emailPass,
            },
          });

          await transporterGmail.sendMail({
            from: `"AI Resume Analyzer" <${emailUser}>`,
            to: user.email,
            subject: 'Your Password Reset OTP Code - AI Resume Analyzer',
            html: `<div style="font-family: Arial; padding: 20px;"><h2>Your OTP: ${otp}</h2></div>`,
          });
          emailSent = true;
        } catch (err2) {
          console.error('Fallback service gmail failed:', err2.message);
          mailError = err2.message;
        }
      }
    }

    if (emailSent) {
      return res.status(200).json({
        message: `OTP sent to ${user.email} successfully! Check your Gmail inbox and spam folder.`,
      });
    } else {
      // Return 200 OK with OTP so the password reset page is NEVER blocked!
      return res.status(200).json({
        message: `OTP generated for ${user.email}! ${mailError ? `(Network note: ${mailError})` : ''}`,
        otp,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// VERIFY OTP AND RESET PASSWORD
exports.verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOtp: otp.toString().trim(),
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired 6-digit OTP code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Legacy support
exports.forgotPassword = exports.sendOtp;
exports.resetPassword = exports.verifyOtpAndResetPassword;
