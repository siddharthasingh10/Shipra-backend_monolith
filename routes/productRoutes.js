// ecommerce-backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Private routes (seller only)
router.post(
  "/",
  protect,
  authorizeRole("seller"),
  upload.single("image"),
  createProduct
);
router.put(
  "/:id",
  protect,
  authorizeRole("seller"),
  upload.single("image"),
  updateProduct
);
router.delete("/:id", protect, authorizeRole("seller"), deleteProduct);

module.exports = router;
