const express = require("express");
const router = express.Router();
const Training = require("../models/Training");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

router.get("/trainings", verifyToken, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ date: -1 }).lean();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainings" });
  }
});

router.get("/trainings/upcoming", async (req, res) => {
  try {
    const trainings = await Training.find({
      date: { $gte: new Date() },
      status: { $in: ["upcoming", "ongoing"] }
    }).sort({ date: 1 }).limit(10).lean();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch upcoming trainings" });
  }
});

router.post("/trainings", requireAdmin, async (req, res) => {
  try {
    const training = new Training({ ...req.body, createdBy: req.user.id });
    const saved = await training.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/trainings/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Training not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/trainings/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Training.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Training not found" });
    res.json({ message: "Training deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
