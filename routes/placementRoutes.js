const express = require("express");
const router = express.Router();
const Placement = require("../models/Placement");
const requireAdmin = require("../middleware/adminMiddleware");
router.get("/placements", async (req, res) => {
  try {
    const placements = await Placement.find().sort({ yearOrder: 1 }).lean();
    res.status(200).json(placements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/placements", requireAdmin, async (req, res) => {
  try {
    const newPlacement = new Placement(req.body);
    const savedPlacement = await newPlacement.save();
    res.status(201).json(savedPlacement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.put("/placements/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await Placement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ message: "Placement record not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/placements/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Placement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Placement record not found" });
    }
    res.json({ message: "Placement record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;