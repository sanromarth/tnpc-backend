const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

// Escape regex special characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Time-gated auto-expire: only run updateMany at most once per 60 seconds
let lastExpireCheck = 0;
async function autoExpireJobs() {
    const now = Date.now();
    if (now - lastExpireCheck < 60000) return;
    lastExpireCheck = now;
    try {
        await Job.updateMany(
            { deadline: { $lt: new Date() }, status: "active" },
            { $set: { status: "expired" } }
        );
    } catch (err) {
        console.error("Auto-expire jobs error:", err.message);
    }
}

router.get("/jobs", async (req, res) => {
    try {
        const { status, type, company, search, page, limit: limitParam } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (company) filter.company = { $regex: escapeRegex(company.substring(0, 100)), $options: "i" };
        if (search) {
            const safeSearch = escapeRegex(search.substring(0, 100));
            filter.$or = [
                { company: { $regex: safeSearch, $options: "i" } },
                { role: { $regex: safeSearch, $options: "i" } }
            ];
        }

        // Run auto-expire (time-gated, at most once/min)
        await autoExpireJobs();

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(limitParam) || 50));
        const skip = (pageNum - 1) * limit;
        const total = await Job.countDocuments(filter);
        const jobs = await Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
        res.json({
            jobs,
            pagination: { page: pageNum, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
});

router.get("/jobs/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).lean();
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch job" });
    }
});

router.post("/jobs", requireAdmin, async (req, res) => {
    try {
        const { company, role } = req.body;
        if (!company || !role) {
            return res.status(400).json({ message: "Company and role are required" });
        }
        const job = new Job({
            ...req.body,
            postedBy: req.user.id
        });
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to create job" });
    }
});

router.put("/jobs/:id", requireAdmin, async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to update job" });
    }
});

router.delete("/jobs/:id", requireAdmin, async (req, res) => {
    try {
        const deleted = await Job.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.json({ message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete job" });
    }
});

module.exports = router;
