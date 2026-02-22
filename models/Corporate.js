const mongoose = require("mongoose");

const corporateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Corporate name is required"],
    trim: true
  },
  type: {
    type: String,
    trim: true,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Corporate", corporateSchema);
