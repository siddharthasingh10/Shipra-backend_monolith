// ecommerce-backend/models/Product.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: [true, "Please add a title"] },
    description: { type: String },
    price: { type: Number, required: [true, "Please add a price"] },
    images: [{ type: String }], // Cloudinary URLs ya local paths
    category: { type: String, default: "General" },
    size: [{ type: String }], // e.g., ["S", "M", "L"]
    stock: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
