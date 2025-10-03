const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SleepLog = require("../models/SleepLog");

// Helper: get displayDate in local time
function getDisplayDateLocal(bedTime, wakeTime) {
  const wake = new Date(wakeTime);
  const bed = new Date(bedTime);

  // Wake time in local
  const wakeLocal = new Date(wake.getTime() - wake.getTimezoneOffset() * 60000);
  const bedLocal = new Date(bed.getTime() - bed.getTimezoneOffset() * 60000);

  // If wake is before noon, consider the night of the previous bed date
  if (wakeLocal.getHours() < 12) {
    return bedLocal.toISOString().slice(0, 10);
  }
  return wakeLocal.toISOString().slice(0, 10);
}

// Add a new sleep log
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { bedTime, wakeTime, notes, quality } = req.body;
    const userId = req.user.userId;

    // Calculate duration in minutes
    const duration = Math.round((new Date(wakeTime) - new Date(bedTime)) / 60000);

    // Compute displayDate correctly
    const displayDate = getDisplayDateLocal(bedTime, wakeTime);

    const sleepLog = await SleepLog.create({
      userId,
      date: new Date(wakeTime), // still store UTC
      bedTime,
      wakeTime,
      duration,
      notes: notes || "",
      quality: quality || 0,
      displayDate, // new field
    });

    res.json(sleepLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add sleep log" });
  }
});

// Fetch weekly logs
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const logs = await SleepLog.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    })
      .sort({ date: 1 })
      .lean();

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sleep logs" });
  }
});

// Fetch today's log
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await SleepLog.find({ userId, date: { $gte: today } }).lean();
    const totalMins = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    res.json({ duration: totalMins, date: today, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today's sleep" });
  }
});

module.exports = router;
