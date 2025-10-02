
const express = require("express");
const router = express.Router();
const { checkAndSaveReferralCode } = require("../utils/goAffPro");


// Route to check referral code 
router.post("/check-referral",checkAndSaveReferralCode);

module.exports = router;
