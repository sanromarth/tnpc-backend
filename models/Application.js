const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "shortlisted", "accepted", "rejected"],
    default: "pending"
  },
  remarks: {
    type: String,
    default: ""
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
