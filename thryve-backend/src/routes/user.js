const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Preferences = require("../models/Preferences");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");
const UserAchievement = require("../models/UserAchievement");
const Progress = require("../models/Progress");

// GET current preferences
router.get("/preferences", authMiddleware, async (req, res) => {
  try {
    let prefs = await Preferences.findOne({ userId: req.user.userId });
    if (!prefs) {
      prefs = await Preferences.create({ userId: req.user.userId });
    }
    res.json({
      dailyCaloriesGoal: prefs.dailyCaloriesGoal,
      dailyProteinGoal: prefs.dailyProteinGoal,
      dailyWorkoutMinutesGoal: prefs.dailyWorkoutMinutesGoal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const { dailyCaloriesGoal, dailyProteinGoal, dailyWorkoutMinutesGoal } =
      req.body;
    const prefs = await Preferences.findOneAndUpdate(
      { userId: req.user.userId },
      {
        dailyCaloriesGoal,
        dailyProteinGoal,
        dailyWorkoutMinutesGoal,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );
    res.json(prefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET current user's profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update profile (age, weight, height)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { age, weight, height } = req.body;
    const userId = req.user.userId || req.user.id || req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { age, weight, height, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Cascade delete related data
    await Preferences.deleteOne({ userId });
    await Meal.deleteMany({ userId });
    await Workout.deleteMany({ userId });
    await UserAchievement.deleteMany({ userId });
    await Progress.deleteMany({ userId });

    res.json({ message: "User and all related data deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
