const mongoose = require("mongoose");

const topCorporateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Corporate name is required"],
    trim: true
  },
  type: {
    type: String,
    enum: ["college", "university", "company"],
    default: "company"
  },
  location: {
    type: String,
    trim: true,
    default: ""
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  tier: {
    type: String,
    enum: ["platinum", "gold", "silver"],
    default: "silver"
  },
  website: {
    type: String,
    trim: true,
    default: ""
  },
  logo: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("TopCorporate", topCorporateSchema);
