const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },

  // ─── Personal Info ───
  personalInfo: {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" },
    portfolio: { type: String, trim: true, default: "" }
  },

  // ─── Career Target ───
  careerTarget: {
    targetRole: { type: String, trim: true, default: "" },
    preferredIndustry: { type: String, trim: true, default: "" },
    experienceLevel: {
      type: String,
      enum: ["", "fresher", "internship", "experienced"],
      default: ""
    }
  },

  // ─── Education ───
  education: [{
    degree: { type: String, trim: true, default: "" },
    college: { type: String, trim: true, default: "" },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    year: { type: String, trim: true, default: "" },
    tenthPercent: { type: Number, default: 0, min: 0, max: 100 },
    twelfthPercent: { type: Number, default: 0, min: 0, max: 100 }
  }],

  // ─── Skills (categorized) ───
  skills: {
    programming: [{ type: String, trim: true }],
    tools: [{ type: String, trim: true }],
    frameworks: [{ type: String, trim: true }],
    databases: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }]
  },

  // ─── Experience ───
  experience: [{
    type: {
      type: String,
      enum: ["internship", "project", "freelance", "leadership"],
      default: "project"
    },
    title: { type: String, trim: true, default: "" },
    organization: { type: String, trim: true, default: "" },
    duration: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    techStack: [{ type: String, trim: true }]
  }],

  // ─── Certifications ───
  certifications: [{
    name: { type: String, trim: true, default: "" },
    issuer: { type: String, trim: true, default: "" },
    date: { type: String, trim: true, default: "" },
    credentialUrl: { type: String, trim: true, default: "" }
  }],

  // ─── Achievements ───
  achievements: [{ type: String, trim: true }],

  // ─── Extra Curricular ───
  extraCurricular: [{ type: String, trim: true }],

  // ─── AI-Generated Content ───
  aiCareerObjective: { type: String, default: "" },
  aiSummary: { type: String, default: "" },

  // ─── Section Order & Visibility ───
  sectionOrder: {
    type: [String],
    default: [
      "careerObjective", "education", "skills", "experience",
      "certifications", "achievements", "extraCurricular"
    ]
  },
  hiddenSections: [{ type: String }],

  // ─── Template ───
  selectedTemplate: {
    type: String,
    enum: ["professional", "modern", "minimal", "creative"],
    default: "professional"
  },

  // ─── ATS Score ───
  atsScore: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    keyword: { type: Number, default: 0, min: 0, max: 100 },
    completeness: { type: Number, default: 0, min: 0, max: 100 },
    impact: { type: Number, default: 0, min: 0, max: 100 },
    formatting: { type: Number, default: 0, min: 0, max: 100 },
    relevance: { type: Number, default: 0, min: 0, max: 100 }
  },

  // ─── Version History ───
  versions: [{
    savedAt: { type: Date, default: Date.now },
    snapshotJSON: { type: String, required: true },
    atsScore: { type: Number, default: 0 },
    label: { type: String, trim: true, default: "" }
  }],

  // ─── Metadata ───
  lastOptimizedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Index for fast lookup
resumeSchema.index({ userId: 1 });

// Limit versions array to 20 entries max
resumeSchema.pre("save", function (next) {
  if (this.versions && this.versions.length > 20) {
    this.versions = this.versions.slice(-20);
  }
  next();
});

module.exports = mongoose.model("Resume", resumeSchema);
