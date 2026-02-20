const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

router.get("/jobs", async (req, res) => {
    try {
        const { status, type, company, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (company) filter.company = { $regex: company, $options: "i" };
        if (search) {
            filter.$or = [
                { company: { $regex: search, $options: "i" } },
                { role: { $regex: search, $options: "i" } }
            ];
        }
        const jobs = await Job.find(filter).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
});

router.get("/jobs/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch job" });
    }
});

router.post("/jobs", requireAdmin, async (req, res) => {
    try {
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
