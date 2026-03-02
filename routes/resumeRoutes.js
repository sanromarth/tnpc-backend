const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const auth = require("../middleware/authMiddleware");

// ─── GET /api/resume — Fetch current user's resume ───
router.get("/resume", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }
    res.json({ success: true, resume });
  } catch (err) {
    console.error("GET /resume error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── POST /api/resume — Create resume (first time) ───
router.post("/resume", auth, async (req, res) => {
  try {
    const existing = await Resume.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Resume already exists. Use PUT to update." });
    }

    const resumeData = sanitizeResumeData(req.body);
    resumeData.userId = req.user.id;

    const resume = new Resume(resumeData);
    await resume.save();
    res.status(201).json({ success: true, message: "Resume created", resume });
  } catch (err) {
    console.error("POST /resume error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── PUT /api/resume — Update resume data ───
router.put("/resume", auth, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      // Auto-create if doesn't exist
      const resumeData = sanitizeResumeData(req.body);
      resumeData.userId = req.user.id;
      resume = new Resume(resumeData);
      await resume.save();
      return res.status(201).json({ success: true, message: "Resume created", resume });
    }

    const updates = sanitizeResumeData(req.body);
    Object.assign(resume, updates);
    await resume.save();
    res.json({ success: true, message: "Resume updated", resume });
  } catch (err) {
    console.error("PUT /resume error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── POST /api/resume/version — Save a version snapshot ───
router.post("/resume/version", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    const { label } = req.body;

    // Create snapshot (exclude versions array to avoid recursive bloat)
    const snapshot = resume.toObject();
    delete snapshot.versions;
    delete snapshot._id;
    delete snapshot.__v;

    resume.versions.push({
      savedAt: new Date(),
      snapshotJSON: JSON.stringify(snapshot),
      atsScore: resume.atsScore?.overall || 0,
      label: typeof label === "string" ? label.slice(0, 100) : ""
    });

    await resume.save();
    res.json({
      success: true,
      message: "Version saved",
      versionsCount: resume.versions.length
    });
  } catch (err) {
    console.error("POST /resume/version error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/resume/versions — Get version history list ───
router.get("/resume/versions", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    // Return lightweight list (no full snapshot data)
    const versions = resume.versions.map((v, i) => ({
      index: i,
      savedAt: v.savedAt,
      atsScore: v.atsScore,
      label: v.label
    }));

    res.json({ success: true, versions });
  } catch (err) {
    console.error("GET /resume/versions error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── PUT /api/resume/restore/:versionIndex — Restore a previous version ───
router.put("/resume/restore/:versionIndex", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    const idx = parseInt(req.params.versionIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= resume.versions.length) {
      return res.status(400).json({ success: false, message: "Invalid version index" });
    }

    const snapshot = JSON.parse(resume.versions[idx].snapshotJSON);

    // Restore fields from snapshot
    const restorableFields = [
      "personalInfo", "careerTarget", "education", "skills",
      "experience", "certifications", "achievements", "extraCurricular",
      "aiCareerObjective", "aiSummary", "sectionOrder", "hiddenSections",
      "selectedTemplate", "atsScore"
    ];
    for (const field of restorableFields) {
      if (snapshot[field] !== undefined) {
        resume[field] = snapshot[field];
      }
    }

    await resume.save();
    res.json({ success: true, message: "Version restored", resume });
  } catch (err) {
    console.error("PUT /resume/restore error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── Sanitize helper ───
function sanitizeResumeData(body) {
  const allowed = [
    "personalInfo", "careerTarget", "education", "skills",
    "experience", "certifications", "achievements", "extraCurricular",
    "aiCareerObjective", "aiSummary", "sectionOrder", "hiddenSections",
    "selectedTemplate", "atsScore", "lastOptimizedAt"
  ];
  const clean = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      clean[key] = body[key];
    }
  }
  return clean;
}

module.exports = router;
