const { testConnection } = require("./utils/shopifyApi");

async function debug() {
  console.log("🔍 Starting Shopify debug...");
  console.log("====================================");
  
  // Check environment variables
  console.log("📋 Environment check:");
  console.log("SHOPIFY_STORE_URL:", process.env.SHOPIFY_STORE_URL || "NOT SET");
  console.log("SHOPIFY_ADMIN_API_TOKEN:", 
    process.env.SHOPIFY_ADMIN_API_TOKEN ? 
    process.env.SHOPIFY_ADMIN_API_TOKEN.substring(0, 10) + "..." : 
    "NOT SET"
  );
  
  console.log("====================================");
  console.log("🧪 Testing connection...");
  
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log("❌ Connection failed - check the errors above");
    console.log("💡 Common solutions:");
    console.log("1. Check your .env file values");
    console.log("2. Verify API token permissions in Shopify admin");
    console.log("3. Ensure store URL is correct (just subdomain.myshopify.com)");
    console.log("4. Check if API token is still valid");
  } else {
    console.log("✅ Connection successful! You can now test customer creation");
  }
}

debug().catch(console.error);