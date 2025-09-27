const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../src/models/User");
const UserSettings = require("../src/models/UserSettings");

async function migrateSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});
    for (const u of users) {
      await UserSettings.findOneAndUpdate(
        { userId: u._id },
        {
          weekStart: u.weekStart || "Monday",
          dailyCaloriesGoal: u.dailyCaloriesGoal || 2000,
          dailyWorkoutMinutesGoal: u.dailyWorkoutMinutesGoal || 30,
          dailyProteinGoal: u.dailyProteinGoal || 100,
        },
        { upsert: true }
      );
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrateSettings();
