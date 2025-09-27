const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Progress = require("../models/Progress");

// GET progress for a user (optionally by date range)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.userId };

    if (startDate || endDate) query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);

    const progress = await Progress.find(query).sort({ date: 1 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      date = new Date(),
      caloriesConsumed = 0,
      proteinConsumed = 0,
      workoutMinutes = 0,
    } = req.body;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const updatedProgress = await Progress.findOneAndUpdate(
      { userId, date: dayStart },
      { 
        $inc: { caloriesConsumed, proteinConsumed, workoutMinutes },
        $setOnInsert: { date: dayStart } // set date if new doc
      },
      { new: true, upsert: true }
    );

    res.json(updatedProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
