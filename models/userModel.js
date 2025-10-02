const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
name: { type: String, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
phone: { type: String, trim: true, default: null },
address: { type: String, trim: true, default: null },
shopifyCustomerId: { type: String, default: null },
role: { type: String, enum: ['user', 'admin'], default: 'user' },
isActive: { type: Boolean, default: true },
wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);





// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },

//     email: { 
//       type: String, 
//       required: true, 
//       unique: true, 
//       lowercase: true, 
//       trim: true, 
//       match: [/^\S+@\S+\.\S+$/, "Invalid email format"] 
//     },

//     // password: { type: String, required: true, minlength: 6 },

//     phone: { type: String, trim: true, match: [/^\d{10}$/, "Phone must be 10 digits"] },

//     address: {
//       street: { type: String, trim: true, maxlength: 100 },
//       city: { type: String, trim: true, maxlength: 50 },
//       state: { type: String, trim: true, maxlength: 50 },
//       country: { type: String, trim: true, maxlength: 50 },
//       postalCode: { type: String, trim: true, match: [/^\d{5,6}$/, "Invalid postal code"] },
//     },

//     shopifyCustomerId: { type: String, default: null, trim: true },

//     role: { type: String, enum: ["customer", "admin"], default: "customer" },

//     isActive: { type: Boolean, default: true },

//     wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);


