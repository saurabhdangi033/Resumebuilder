const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User"); // Assume you have a User model


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// Get User Profile (Protected)
router.get('/profile', authMiddleware, getProfile);

// Update User Profile (Protected)
router.put('/profile', authMiddleware, updateProfile);



router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User with this email does not exist." });
      }
  
      // Generate a reset token (JWT)
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  
      // Create reset URL
      const resetLink = `http://localhost:3000/reset-password/${token}`;
  
      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset",
        html: `<p>You requested for a password reset</p>
               <p>Click <a href="${resetLink}">here</a> to reset your password. The link will expire in 1 hour.</p>`,
      });
  
      res.json({ message: "Password reset link sent to your email." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  });


  // Reset Password Endpoint
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      // Verify the reset token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.json({ message: "Password reset successfully." });
    } catch (error) {
      console.error(error);
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset token expired. Please request a new link." });
      }
      res.status(500).json({ message: "Internal server error." });
    }
  });

module.exports = router;
