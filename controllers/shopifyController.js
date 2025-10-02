const { getCustomerByEmail, createCustomer } = require("../utils/shopifyApi");

// Create Customer Controller
const createCustomerController = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        success: false,
        message: "First name, last name, and email are required fields",
        missingFields: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email
        }
      });
    }

    // Check if customer already exists
    const existingCustomer = await getCustomerByEmail(email);
    if (existingCustomer) {
      return res.status(409).json({ 
        success: false,
        message: "Customer already exists with this email address",
        customerEmail: email
      });
    }

    // Create new customer
    const customerData = {
      firstName,
      lastName,
      phone,
      email,
      tags: ["new_customer"],
    };

    const newCustomer = await createCustomer(customerData);
    
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: newCustomer
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create customer",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Customer by Email Controller
const getCustomerController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email address is required",
        field: "email"
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        invalidEmail: email
      });
    }

    const customer = await getCustomerByEmail(email);
    
    if (customer) {
      res.json({
        success: true,
        message: "Customer found successfully",
        customer: customer
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Customer not found with the provided email address",
        searchedEmail: email
      });
    }
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch customer information",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = { createCustomerController, getCustomerController };