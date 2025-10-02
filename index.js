const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes")
const shopifyRoutes = require("./routes/shopifyRoutes"); // shopify routes
const goaffproRoutes = require("./routes/goaffpro"); // GoAffPro routes
const delhiveryRoutes = require("./routes/delhiveryRoutes"); // delhivery routes

dotenv.config();
const app = express();

// ✅ FIX 1: Add trust proxy setting (MUST be before rate limiting)
app.set('trust proxy', true);

app.use(express.json());
app.use(cors()); // ✅ Add CORS middleware

// Rate limiting
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true, // ✅ Add these
  legacyHeaders: false   // ✅ Add these
});
app.use(limiter);

// Mount routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/shopify-customer", shopifyRoutes);
app.use("/api/affiliates", goaffproRoutes);
app.use("/api/delhivery", delhiveryRoutes);

// Checking is API live
app.get("/", (req, res) => {
  res.send("API is running…");
});

// Error handler (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);