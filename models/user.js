const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },
  phone: {
    type: String,
    trim: true,
    default: ""
  },
  department: {
    type: String,
    trim: true,
    default: ""
  },
  registerNumber: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
