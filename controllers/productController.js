// ecommerce-backend/controllers/productController.js

const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, images, category, size, stock } =
      req.body;

    const image = req.file?.path;

    const newProduct = new Product({
      seller: req.user._id,
      title,
      description,
      price,
      images: [image],
      category,
      size,
      stock,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // // ADDING FILTERS
    const queryObj = {};
    // if there is category in URL (Like /api/products?category=Clothes), toh add category to queryObj
    if (req.query.category) queryObj.category = req.query.category;
    // if there is Min or max price in URL (jaise /api/products?minPrice=100&maxPrice=500), toh add price filter
    if (req.query.minPrice && req.query.maxPrice) {
      queryObj.price = {
        $gte: Number(req.query.minPrice),
        $lte: Number(req.query.maxPrice),
      };
    }
    // same isme bhi if (/api/products?size=M,L)
    if (req.query.size) {
      const sizes = req.query.size.split(",");
      queryObj.size = { $in: sizes };
    }
    // After filtering show the products
    const products = await Product.find(queryObj);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (prod) {
      res.json(prod);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    if (prod.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const updatedFields = req.body; // { title, price, ... }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    if (prod.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await prod.remove();
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
