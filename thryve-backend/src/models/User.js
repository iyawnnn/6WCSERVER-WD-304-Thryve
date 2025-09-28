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
  age: { type: Number, min: 10, max: 120 },
  weight: { type: Number, min: 20, max: 500 },
  height: { type: Number, min: 50, max: 250 },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Cascade delete related documents on deleteOne
userSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
  try {
    const userId = this._id;
    await Promise.all([
      Meal.deleteMany({ userId }),
      Workout.deleteMany({ userId }),
      UserAchievement.deleteMany({ userId }),
      Progress.deleteMany({ userId }),
      Preferences.deleteOne({ userId }),
    ]);
    next();
  } catch (err) {
    next(err);
  }
});

// Fallback for .remove() calls
userSchema.pre("remove", async function(next) {
  try {
    const userId = this._id;
    await Promise.all([
      Meal.deleteMany({ userId }),
      Workout.deleteMany({ userId }),
      UserAchievement.deleteMany({ userId }),
      Progress.deleteMany({ userId }),
      Preferences.deleteOne({ userId }),
    ]);
    next();
  } catch (err) {
    next(err);
  }
});

// Unique index on email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
