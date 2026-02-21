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
  course: {
    type: String,
    trim: true,
    default: ""
  },
  specialization: {
    type: String,
    trim: true,
    default: ""
  },
  registerNumber: {
    type: String,
    trim: true,
    default: ""
  },
  batch: {
    type: String,
    trim: true,
    default: ""
  },
  cgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  tenthPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  twelfthPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  backlogs: {
    type: Number,
    default: 0,
    min: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  resumeUrl: {
    type: String,
    default: ""
  },
  placementStatus: {
    type: String,
    enum: ["not-placed", "placed", "opted-out"],
    default: "not-placed"
  },
  certificationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  otpCode: {
    type: String,
    default: ""
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
