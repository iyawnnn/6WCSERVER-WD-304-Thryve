const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SleepLog = require("../models/SleepLog");

// Add a new sleep log
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { bedTime, wakeTime } = req.body;
    const userId = req.user.userId;

    // calculate duration in minutes
    const duration = Math.round((new Date(wakeTime) - new Date(bedTime)) / 60000);

    const sleepLog = await SleepLog.create({
      userId,
      date: new Date(wakeTime),
      bedTime,
      wakeTime,
      duration,
    });

    res.json(sleepLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add sleep log" });
  }
});

// Get last 7 days sleep logs
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const logs = await SleepLog.find({ userId })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    res.json(logs.reverse()); // oldest → newest
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sleep logs" });
  }
});


router.get("/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await SleepLog.find({ userId, date: { $gte: today } }).lean();
    const totalMins = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    res.json({ duration: totalMins, date: today });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today's sleep" });
  }
});


module.exports = router;
