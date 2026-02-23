const express = require("express");
const router = express.Router();
const Corporate = require("../models/Corporate");
const requireAdmin = require("../middleware/adminMiddleware");

router.get("/corporates", async (req, res) => {
  try {
    const corporates = await Corporate.find().sort({ createdAt: -1 }).lean();
    res.json(corporates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch corporates", error: error.message });
  }
});

router.post("/corporates", requireAdmin, async (req, res) => {
  try {
    const corporate = new Corporate(req.body);
    const saved = await corporate.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to add corporate", error: error.message });
  }
});

router.delete("/corporates/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Corporate.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Corporate not found" });
    }
    res.json({ message: "Corporate deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete corporate", error: error.message });
  }
});

module.exports = router;
