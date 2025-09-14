// server/controllers/wishlistController.js

const Wishlist = require("../models/Wishlist");

//  Add product to wishlist
//  POST /api/wishlist
exports.addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to add", error: error.message });
  }
};

//  Get wishlist
//  GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products"
    );
    res.status(200).json(wishlist || { products: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch", error: error.message });
  }
};

//  Remove product from wishlist
//  DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (prd) => prd.toString() !== req.params.productId
    );

    await wishlist.save();
    res.status(200).json({ message: "Product removed", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove", error: error.message });
  }
};
