
const mongoose = require("mongoose");
const AffiliateSchema = new mongoose.Schema({
 affiliateCode: { type: String, unique: true }, // e.g. STEVE123
 name: String,
 goaffproId: String,
 createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Affiliate", AffiliateSchema);  