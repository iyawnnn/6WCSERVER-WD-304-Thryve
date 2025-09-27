const express = require('express');
const router = express.Router();
const UserAchievement = require("../models/UserAchievement");
const MasterAchievement = require("../models/MasterAchievement");
const { checkAchievements } = require('../utils/achievementService');
const protect = require('../middleware/authMiddleware');

// ---------------------------
// Get all master achievements
// GET /api/achievements/master
router.get('/master', protect, async (req, res) => {
  try {
    const masterList = await MasterAchievement.find({}).sort({ type: 1 }).lean();
    res.json(masterList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// Get achievements earned by a specific user
// GET /api/achievements/:userId
router.get('/:userId', protect, async (req, res) => {
  try {
    const achievements = await UserAchievement.find({ userId: req.params.userId }).lean();
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// Check and award achievements for a user
// POST /api/achievements/check/:userId
router.post('/check/:userId', protect, async (req, res) => {
  try {
    await checkAchievements(req.params.userId);
    res.json({ message: 'Achievements checked and updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
