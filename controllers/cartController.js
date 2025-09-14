// server/controllers/cartController.js

const Cart = require("../models/cartModel");

//  Add or update product in cart
//  POST /api/cart
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // No cart yet, create new
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      // Cart exists, check if product already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Product already in cart → update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Not in cart → push new product
        cart.items.push({ product: productId, quantity });
      }
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Add to cart failed", error: error.message });
  }
};

// Get user's cart
// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetch cart failed", error: error.message });
  }
};

//  Update item quantity
//  PUT /api/cart
exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Remove item from cart
// DELETE /api/cart/:productId
exports.removeCartItem = async (req, res) => {
  const productId = req.params.productId;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    res.status(500).json({ message: "Remove failed", error: error.message });
  }
};

// Empty the cart
// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Clear failed", error: error.message });
  }
};
