// ecommerce-backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// /api/auth/register
router.post("/register", registerUser);

// /api/auth/login
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

module.exports = router;
