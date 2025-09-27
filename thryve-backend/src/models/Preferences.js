const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  dailyCaloriesGoal: { type: Number, default: 2000 },
  dailyWorkoutMinutesGoal: { type: Number, default: 30 },
  dailyProteinGoal: { type: Number, default: 100 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "Preferences",
  preferencesSchema,
  "preferences"
);
