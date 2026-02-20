const express = require("express");
const router = express.Router();
const TopCorporate = require("../models/TopCorporate");
const requireAdmin = require("../middleware/adminMiddleware");


router.get("/top-corporates", async (req, res) => {
  try {
    const corporates = await TopCorporate.find().sort({ tier: 1, name: 1 });
    res.status(200).json(corporates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch corporates", error: error.message });
  }
});


router.post("/top-corporates", requireAdmin, async (req, res) => {
  try {
    const newCorporate = new TopCorporate(req.body);
    const saved = await newCorporate.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to add corporate", error: error.message });
  }
});


router.delete("/top-corporates/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await TopCorporate.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Corporate not found" });
    }
    res.json({ message: "Corporate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete corporate", error: error.message });
  }
});

module.exports = router;

