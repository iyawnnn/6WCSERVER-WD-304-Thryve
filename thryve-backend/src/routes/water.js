const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const WaterLog = require("../models/WaterLog");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/water – log water
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const { amount } = req.body;
    const date = new Date().toISOString().split("T")[0];

    const log = await WaterLog.findOneAndUpdate(
      { userId, date },
      { $inc: { amount } },
      { new: true, upsert: true }
    );

    res.json(log);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error logging water", error: err.message });
  }
});

// GET /api/water – get today's water intake
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const date = new Date().toISOString().split("T")[0];

    const log = await WaterLog.findOne({ userId, date });
    res.json(log || { amount: 0, date });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching water log", error: err.message });
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
      date: { $gte: startDate.toISOString().split("T")[0] },
    }).sort({ date: 1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching weekly logs", error: err.message });
  }
});

module.exports = router;
