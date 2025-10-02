const express = require("express");
const router = express.Router();
const {createCustomerController, getCustomerController } = require("./../controllers/shopifyController");

// Create a new customer
router.post("/", createCustomerController);

// Get customer by EMAIL
router.get("/find", getCustomerController);

module.exports = router;
