const mongoose = require("mongoose");
const Meal = require("./Meal");
const Workout = require("./Workout");
const UserAchievement = require("./UserAchievement");
const Progress = require("./Progress");
const Preferences = require("./Preferences");


const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },

  // profile fields
  age: { type: Number, min: 10, max: 120 },

  // Store in base units only
  weight: { type: Number, min: 20, max: 500 }, // always kg
  height: { type: Number, min: 50, max: 250 }, // always cm

  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

userSchema.pre("remove", async function(next) {
  try {
    const userId = this._id;

    // Delete all related documents
    await Meal.deleteMany({ userId });
    await Workout.deleteMany({ userId });
    await UserAchievement.deleteMany({ userId });
    await Progress.deleteMany({ userId });
    await Preferences.deleteOne({ userId });

    next();
  } catch (err) {
    next(err);
  }
});

// Ensure unique index on email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
