const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const WaterLog = require("../models/WaterLog");
const authMiddleware = require("../middleware/authMiddleware");
const achievementService = require("../utils/achievementService");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { amount } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const log = await WaterLog.findOneAndUpdate(
      { userId, date },
      { 
        $inc: { totalAmount: amount },
        $push: { entries: { time, amount } }
      },
      { new: true, upsert: true }
    );

    // ✅ Call achievement check after logging water
    await achievementService.checkAchievements(req.user.userId);

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging water", error: err.message });
  }
});



// GET /api/water – get today's water intake
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const date = new Date().toISOString().split("T")[0];

    const log = await WaterLog.findOne({ userId, date });
    if (!log) return res.json({ totalAmount: 0, entries: [] });

    res.json({ totalAmount: log.totalAmount, entries: log.entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching water log", error: err.message });
  }
});


// GET /api/water/weekly – get last 7 days
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // last 7 days

    const logs = await WaterLog.find({
      userId,
      date: { $gte: startDate.toISOString().split("T")[0] }
    }).sort({ date: 1 });

    // Return totalAmount only for weekly chart
    res.json(logs.map(l => ({ date: l.date, amount: l.totalAmount })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly logs", error: err.message });
  }
});

// POST /api/water/reset – reset today's water intake
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const date = new Date().toISOString().split("T")[0];

    const log = await WaterLog.findOneAndUpdate(
      { userId, date },
      { totalAmount: 0, entries: [] },
      { new: true, upsert: true }
    );

    res.json({ message: "Today's water reset", log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting water", error: err.message });
  }
});




module.exports = router;
