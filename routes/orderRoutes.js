// server/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const { placeOrder, getUserOrders ,updateOrderStatus } = require("../controllers/orderController");
const { protect, authorizeRole } = require("../middlewares/authMiddleware");

// Place an order from cart
router.post("/", protect, authorizeRole("buyer"), placeOrder);

// Get user's orders
router.get("/", protect, authorizeRole("buyer"), getUserOrders);

// Seller route: update order status
router.put(
  "/:orderId/status",
  protect,
  authorizeRole("seller"),
  updateOrderStatus
);
module.exports = router;
