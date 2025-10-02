const axios = require("axios");
const Affiliate = require("../models/affiliateModel");


// ----------------- GoAffPro API -----------------
const GOAFFPRO_ACCESS_TOKEN = process.env.GOAFFPRO_ACCESS_TOKEN;
const GOAFFPRO_API_BASE = process.env.GOAFFPRO_API_BASE;

// Check if referral code exists in GoAffPro and save to DB
async function checkAndSaveReferralCode(refCode) {
  try {
    const response = await axios.get(`${GOAFFPRO_API_BASE}/admin/affiliates`, {
      headers: {
        "x-goaffpro-access-token": GOAFFPRO_ACCESS_TOKEN,
        accept: "application/json",
      },
      params: {  
        ref_code: refCode,
        fields: "ref_code,name,id",
      },
    });

    const affiliateData = response.data?.affiliates?.[0];
    if (!affiliateData) {
      return { exists: false, message: "Referral code not found" };
    }
    console.log("Affiliate Data from GoAffPro:", affiliateData);

    // Upsert into MongoDB
    let affiliate = await Affiliate.findOne({ affiliateCode: affiliateData.ref_code });
  
    if (!affiliate) {
        affiliate = await Affiliate.create({
        affiliateCode: affiliateData.ref_code,
        name: affiliateData.name,
        goaffproId: affiliateData.id,
    });
     
    }

    return { exists: true, affiliate };
  } catch (err) {
    console.error("GoAffPro API Error:", err.response?.data || err.message);
    return { exists: false, error: err.message };
  }
}

// (async () => {
//   const result = await checkAndSaveReferralCode("SIDDHARTHA");
//   console.log(result);
// })();


module.exports = { checkAndSaveReferralCode, Affiliate };

