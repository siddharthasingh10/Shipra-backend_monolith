  // ecommerce-backend/controllers/authController.js

  const jwt = require("jsonwebtoken");
  const User = require("../models/userModel");
  const dotenv = require("dotenv");
  dotenv.config();

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  };

  exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await User.create({ name, email, password, role });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Rehistration Fail", error: error.message });
    }
  };

  exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find the user in the database by email
      const user = await User.findOne({ email });

      // If user exists and password matches
      if (user && (await user.matchPassword(password))) {
        // Respond with user details and a JWT token
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        // If email or password is incorrect, send error response
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      // Handle any server or database errors
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  exports.logoutUser = async (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
  };
  