const express = require("express");
const router = express.Router();
const MasterAchievement = require("../models/MasterAchievement");

// GET /api/master-achievements
router.get("/", async (req, res) => {
  try {
    const achievements = await MasterAchievement.find();
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
