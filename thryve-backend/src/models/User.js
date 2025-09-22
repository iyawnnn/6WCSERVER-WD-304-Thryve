const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  password: { type: String, required: true },
  age: { type: Number, min: 10, max: 120 },
  weight: { type: Number, min: 20, max: 500 },
  height: { type: Number, min: 50, max: 250 },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique index on email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
