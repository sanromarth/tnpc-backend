const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
  batch: {
    type: String,
    required: [true, "Batch is required"],
    trim: true
  },
  yearOrder: {
    type: Number,
    required: [true, "Year order is required"]
  },
  totalStudents: {
    type: Number,
    required: [true, "Total students count is required"],
    min: [0, "Cannot be negative"]
  },
  eligibleStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  placementsOffered: {
    type: Number,
    default: 0,
    min: 0
  },
  distinctOffers: {
    type: Number,
    default: 0,
    min: 0
  },
  companiesVisited: {
    type: Number,
    default: 0,
    min: 0
  },
  highestCTC: {
    type: Number,
    default: 0,
    min: 0
  },
  avgCTC: {
    type: Number,
    default: 0,
    min: 0
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Placement", placementSchema);