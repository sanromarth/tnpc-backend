const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, "Company name is required"],
    trim: true
  },
  role: {
    type: String,
    required: [true, "Job role is required"],
    trim: true
  },
  location: {
    type: String,
    default: "On-site",
    trim: true
  },
  salary: {
    type: String,
    default: "Not Disclosed"
  },
  description: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["Full-time", "Internship", "Part-time", "Contract"],
    default: "Full-time"
  },
  status: {
    type: String,
    enum: ["active", "closed", "expired"],
    default: "active"
  },
  eligibility: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  skills: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Job", jobSchema);
