const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["workshop", "seminar", "placement-drive", "training", "webinar", "hackathon"],
    default: "training"
  },
  date: {
    type: Date,
    required: [true, "Date is required"]
  },
  endDate: {
    type: Date
  },
  venue: {
    type: String,
    default: ""
  },
  company: {
    type: String,
    default: ""
  },
  eligibility: {
    type: String,
    default: "All students"
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Training", trainingSchema);
