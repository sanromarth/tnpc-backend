const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
router.post("/applications", verifyToken, async (req, res) => {
    try {
        const existing = await Application.findOne({
            jobId: req.body.jobId,
            studentId: req.user.id
        });
        if (existing) {
            return res.status(400).json({ message: "Already applied to this job" });
        }

        const application = new Application({
            jobId: req.body.jobId,
            studentId: req.user.id
        });
        await application.save();
        res.status(201).json(application);
    } catch (error) {
        console.error("Application submit error:", error.message);
        res.status(500).json({ message: "Failed to submit application" });
    }
});
router.get("/applications", requireAdmin, async (req, res) => {
    try {
        const applications = await Application.find()
            .populate("jobId", "company role salary location deadline type status")
            .populate("studentId", "name email course specialization registerNumber")
            .sort({ appliedAt: -1 }).lean();
        res.json(applications);
    } catch (error) {
        console.error("Fetch applications error:", error.message);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
});
router.get("/applications/my", verifyToken, async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user.id })
            .populate("jobId", "company role location salary deadline type status")
            .sort({ appliedAt: -1 }).lean();
        res.json(applications);
    } catch (error) {
        console.error("Fetch user applications error:", error.message);
        res.status(500).json({ message: "Failed to fetch your applications" });
    }
});
router.patch("/applications/:id", requireAdmin, async (req, res) => {
    try {
        const { status, remarks } = req.body;
        if (!["pending", "shortlisted", "accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateData = { status };
        if (remarks !== undefined) updateData.remarks = remarks;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate("jobId", "company role")
            .populate("studentId", "name email");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json(application);
    } catch (error) {
        console.error("Update application error:", error.message);
        res.status(500).json({ message: "Failed to update application status" });
    }
});

router.delete("/applications/:id", verifyToken, async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            studentId: req.user.id
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found or unauthorized" });
        }
        if (application.status !== "pending") {
            return res.status(400).json({ message: "Can only withdraw pending applications" });
        }
        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
        console.error("Withdraw application error:", error.message);
        res.status(500).json({ message: "Failed to withdraw application" });
    }
});

module.exports = router;

