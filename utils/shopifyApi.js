const axios = require("axios");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const shopDomain = process.env.SHOPIFY_STORE_URL;
const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
const apiVersion = "2023-10";

//  Helper: format phone to E.164
function formatPhone(phone, defaultCountry = "IN") {
  if (!phone) return null;
  const parsed = parsePhoneNumberFromString(phone, defaultCountry);
  if (parsed && parsed.isValid()) {
    return parsed.format("E.164");
  }
  return null;
}

//  Create Shopify Customer (REST API)
async function createCustomer(customerData) {
  const formattedPhone = customerData.phone
    ? formatPhone(customerData.phone, "IN")
    : null;

  const url = `https://${shopDomain}/admin/api/${apiVersion}/customers.json`;

  try {
    const response = await axios.post(
      url,
      {
        customer: {
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: formattedPhone,
          verified_email: true,
          tags: customerData.tags || [],
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.customer;
  } catch (error) {
    console.error(
      "❌ Shopify REST API Error (Create):",
      error.response?.data || error.message
    );
    throw error;
  }
}


  // Fetch Customer by Email (REST API)
async function getCustomerByEmail(email) {
  const url = `https://${shopDomain}/admin/api/${apiVersion}/customers/search.json?query=email:${email}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    return response.data.customers.length > 0
      ? response.data.customers[0]
      : null;
  } catch (error) {
    console.error(
      "❌ Shopify REST API Error (Fetch):",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = {
  createCustomer,
  getCustomerByEmail,
};






