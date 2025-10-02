require("dotenv").config();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { createCustomer, getCustomerByEmail } = require("../utils/shopifyApi");

const OTP_EXPIRY_MIN = parseInt(process.env.OTP_EXPIRY_MIN || "5", 10);

// in-memory OTP store
const otpStore = new Map();

// transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// helper: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SEND OTP 
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000);

    otpStore.set(email, { code: otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MIN} minute(s).`,
    });

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Error in sendOtp:", err);
    return res
      .status(500)
      .json({ error: "Error sending OTP", details: err.message });
  }
};

// Verify OTP and login/register user
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const record = otpStore.get(email);
    if (!record)
      return res
        .status(400)
        .json({ error: "No OTP requested for this email or OTP expired" });

    // check expiry
    if (record.expiresAt < new Date()) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP valid -> remove it
    otpStore.delete(email);

    // STEP 1: Check if user exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // STEP 2: Check if exists in Shopify
      let shopifyCustomer = await getCustomerByEmail(email);

      if (shopifyCustomer) {
        // ✅ Found in Shopify → create user in DB
        user = await User.create({
          name: `${shopifyCustomer.first_name || ""} ${
            shopifyCustomer.last_name || ""
          }`.trim(),
          email: shopifyCustomer.email,
          phone: shopifyCustomer.phone || null,
          address:
            shopifyCustomer.default_address?.address1 ||
            shopifyCustomer.default_address?.city ||
            null,
          shopifyCustomerId: shopifyCustomer.id,
        });
      } else {
        // ❌ Not in Shopify → Create new in Shopify, then in DB
        const newCustomer = await createCustomer({
          firstName: "",
          lastName: "",
          email: email,
          phone: null,
          tags: ["app-user"],
        });

        user = await User.create({
          name: `${newCustomer.first_name || ""} ${
            newCustomer.last_name || ""
          }`.trim(),
          email: newCustomer.email,
          phone: newCustomer.phone || null,
          address:
            newCustomer.default_address?.address1 ||
            newCustomer.default_address?.city ||
            null,
          shopifyCustomerId: newCustomer.id,
        });
      }
    }

    // STEP 3: Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_do_change",
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    );

    return res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        shopifyCustomerId: user.shopifyCustomerId,
      },
    });
  } catch (err) {
    console.error("❌ Error in verifyOtp:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
