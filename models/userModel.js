// ecommerce-backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
        validate: {
          validator: function (v) {
            return validator.isEmail(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
    },

    password: {
      type: String,
      required: [true, "Please Enter a password"],
      minlength: 5,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

// hook to hash Password 
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify Password 
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
