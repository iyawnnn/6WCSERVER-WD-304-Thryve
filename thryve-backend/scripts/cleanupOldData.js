const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../src/models/User");
const Preferences = require("../src/models/Preferences");
const Meal = require("../src/models/Meal");
const Workout = require("../src/models/Workout");
const UserAchievement = require("../src/models/UserAchievement");
const Progress = require("../src/models/Progress");

// The user you want to keep
const MAIN_USER_ID = "68d14210f35ccf97d8ed1eb7"; // Ian

async function cleanupOldData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Remove Preferences of old/deleted users
    const prefResult = await Preferences.deleteMany({
      userId: { $ne: MAIN_USER_ID },
    });
    console.log("Preferences removed:", prefResult.deletedCount);

    // Remove Meals
    const mealResult = await Meal.deleteMany({ userId: { $ne: MAIN_USER_ID } });
    console.log("Meals removed:", mealResult.deletedCount);

    // Remove Workouts
    const workoutResult = await Workout.deleteMany({
      userId: { $ne: MAIN_USER_ID },
    });
    console.log("Workouts removed:", workoutResult.deletedCount);

    // Remove UserAchievements
    const achievementResult = await UserAchievement.deleteMany({
      userId: { $ne: MAIN_USER_ID },
    });
    console.log("UserAchievements removed:", achievementResult.deletedCount);

    // Remove Progress
    const progressResult = await Progress.deleteMany({
      userId: { $ne: MAIN_USER_ID },
    });
    console.log("Progress removed:", progressResult.deletedCount);

    console.log("Cleanup complete. Only main user data remains.");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error during cleanup:", err);
    await mongoose.disconnect();
  }
}

cleanupOldData(); // node scripts/cleanupOldData.js