const express = require("express");
const router = express.Router();
const Certification = require("../models/certification");
const requireAdmin = require("../middleware/adminMiddleware");


router.get("/certifications/ibm", async (req, res) => {
    try {
        const data = await Certification.find({ batch: "2026" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching IBM certifications",
            error: error.message
        });
    }
});


router.get("/certifications", async (req, res) => {
    try {
        const data = await Certification.find().sort({ completionDate: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching certifications", error: error.message });
    }
});


router.post("/certifications", requireAdmin, async (req, res) => {
    try {
        const newCert = new Certification(req.body);
        const saved = await newCert.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: "Error adding certification", error: error.message });
    }
});


router.delete("/certifications/:id", requireAdmin, async (req, res) => {
    try {
        const deleted = await Certification.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Certification not found" });
        }
        res.json({ message: "Certification deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting certification", error: error.message });
    }
});

module.exports = router;