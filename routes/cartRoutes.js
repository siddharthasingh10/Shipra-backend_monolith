// cartRoutes.js

const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const { protect, authorizeRole } = require("../middlewares/authMiddleware");

router.get("/", protect, authorizeRole("buyer"), getCart);
router.post("/", protect, authorizeRole("buyer"), addToCart);
router.put("/", protect, authorizeRole("buyer"), updateCartItem);
router.delete("/:productId", protect, authorizeRole("buyer"), removeCartItem);
router.delete("/", protect, authorizeRole("buyer"), clearCart);

module.exports = router;
