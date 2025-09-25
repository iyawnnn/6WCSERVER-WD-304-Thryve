const User = require("../models/User");

// Update preferences (weekStart)
exports.updatePreferences = async (req, res) => {
  const userId = req.user.userId; // <-- change from _id to userId
  const { dailyCaloriesGoal, dailyWorkoutMinutesGoal, dailyProteinGoal } = req.body;

  if (
    dailyCaloriesGoal === undefined &&
    dailyWorkoutMinutesGoal === undefined &&
    dailyProteinGoal === undefined
  ) {
    return res.status(400).json({ error: "No preferences provided" });
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { dailyCaloriesGoal, dailyWorkoutMinutesGoal, dailyProteinGoal },
    { new: true, runValidators: true }
  );

  res.json(updated);
};


// Fetch preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId).select(
      "weekStart dailyCaloriesGoal dailyProteinGoal dailyWorkoutMinutesGoal"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      weekStart: user.weekStart,
      dailyCaloriesGoal: user.dailyCaloriesGoal,
      dailyProteinGoal: user.dailyProteinGoal,
      dailyWorkoutMinutesGoal: user.dailyWorkoutMinutesGoal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
