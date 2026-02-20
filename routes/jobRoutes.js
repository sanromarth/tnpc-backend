const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const requireAdmin = require("../middleware/adminMiddleware");
router.get("/jobs", async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch jobs" });
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

