const User = require("../models/User");
const Preferences = require("../models/Preferences");
const path = require("path");

/**
 * GET /users/profile
 * Returns the currently authenticated user's profile (no sensitive fields).
 */
exports.getProfile = async (req, res, next) => {
  try {
    // exclude password and reset tokens
    const user = await User.findById(req.user.userId).select(
      "-password -resetToken -resetTokenExpiry -__v"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /users/profile
 * Accepts either:
 *  - JSON body (name, age, weight, height, profilePicUrl)
 *  - multipart/form-data with a file field named `profilePic` (handled by multer)
 *
 * Returns the updated user (without sensitive fields).
 */
exports.updateProfile = async (req, res) => {
  try {
    const { age, weight, weightUnit, height, heightUnit } = req.body;

    let weightInKg = weight;
    if (weightUnit === "lb") {
      weightInKg = weight * 0.453592;
    }

    let heightInCm = height;
    if (heightUnit === "ft") {
      const [feet, inches = 0] = height.toString().split(".");
      heightInCm = (parseInt(feet) * 12 + parseInt(inches)) * 2.54;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        age,
        weight: weightInKg,
        weightUnit: "kg",
        height: heightInCm,
        heightUnit: "cm",
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(400).json({ error: "Failed to update profile" });
  }
};

// GET user preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const settings = await Preferences.findOne({ userId: req.user.userId });

    if (!settings) {
      // create default settings if not found
      const newSettings = await Preferences.create({
        userId: req.user.userId,
      });
      return res.json(newSettings);
    }

    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// UPDATE user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { dailyCaloriesGoal, dailyWorkoutMinutesGoal, dailyProteinGoal } =
      req.body;

    const prefs = await Preferences.findOneAndUpdate(
      { userId: req.user.userId }, // req.user from authMiddleware
      {
        dailyCaloriesGoal,
        dailyWorkoutMinutesGoal,
        dailyProteinGoal,
        updatedAt: Date.now(),
      },
      { new: true, upsert: true } // <- upsert ensures doc is created if missing
    );

    res.json({ message: "Preferences updated", preferences: prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};
