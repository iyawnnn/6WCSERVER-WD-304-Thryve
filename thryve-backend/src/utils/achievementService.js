const mongoose = require("mongoose");
const UserAchievement = require("../models/UserAchievement");
const MasterAchievement = require("../models/MasterAchievement");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");
const Water = require("../models/WaterLog");
const Sleep = require("../models/SleepLog");

/**
 * Check and award achievements for a user
 */
async function checkAchievements(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // --- Helper to add achievement safely ---
  const addAchievement = async (master) => {
    if (!master) return;

    try {
      const exists = await UserAchievement.findOne({
        userId: userObjectId,
        type: master.type,
      });
      if (exists) return; // already earned

      await UserAchievement.create({
        userId: userObjectId,
        type: master.type,
        iconUrl: master.iconUrl,
        earnedAt: new Date(),
      });

      console.log(`🏆 Achievement unlocked: ${master.type}`);
    } catch (err) {
      console.error("Error adding achievement:", err);
    }
  };

  // Fetch master list once
  const masterList = await MasterAchievement.find({}).lean();

  // === First Workout ===
  const workoutCount = await Workout.countDocuments({ userId: userObjectId });
  if (workoutCount >= 1) {
    await addAchievement(masterList.find((a) => a.type === "FirstWorkout"));
  }

  // === Ten Workouts ===
  if (workoutCount >= 10) {
    await addAchievement(masterList.find((a) => a.type === "Workout10"));
  }

  // === Five Meals ===
  const mealCount = await Meal.countDocuments({ userId: userObjectId });
  if (mealCount >= 5) {
    await addAchievement(masterList.find((a) => a.type === "FiveMeals"));
  }

  // === 7-Day Streak ===
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const meals = await Meal.find({
    userId: userObjectId,
    date: { $gte: sevenDaysAgo },
  });
  const workouts = await Workout.find({
    userId: userObjectId,
    date: { $gte: sevenDaysAgo },
  });

  // use just the date (no time)
  const loggedDates = new Set(
    [...meals, ...workouts].map((e) => new Date(e.date).toDateString())
  );

  let hasStreak = true;
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(today.getDate() - i);
    if (!loggedDates.has(day.toDateString())) {
      hasStreak = false;
      break;
    }
  }

  if (hasStreak) {
    await addAchievement(masterList.find((a) => a.type === "Streak7Days"));
  }

  // === Calories burned milestones ===
  const totalCalories = await Workout.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: "$calories" } } },
  ]);
  const total = totalCalories[0]?.total || 0;

  if (total >= 1000) {
    await addAchievement(masterList.find((a) => a.type === "Calories1000"));
  }
  if (total >= 5000) {
    await addAchievement(masterList.find((a) => a.type === "Calories5000"));
  }

  // === Hydration Achievements ===
  const waterTotal = await Water.aggregate([
    { $match: { userId: userObjectId } },
    { $unwind: "$entries" }, // flatten each day's entries
    { $group: { _id: null, total: { $sum: "$entries.amount" } } }, // sum ml
  ]);

  const totalMl = waterTotal[0]?.total || 0;
  const glasses = Math.floor(totalMl / 250); // each glass = 250ml

  if (glasses >= 5) {
    await addAchievement(masterList.find((a) => a.type === "Hydration5"));
  }
  if (glasses >= 20) {
    await addAchievement(masterList.find((a) => a.type === "Hydration20"));
  }

  // === Sleep milestones ===
  const sleepLogs = await Sleep.find({ userId: userObjectId });

  // Sleep 7 hours in one night
  if (sleepLogs.some((log) => log.duration >= 7 * 60)) {
    await addAchievement(masterList.find((a) => a.type === "Sleep7"));
  }

  // 3-day streak of 7+ hours
  const sortedSleep = sleepLogs.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  let streak = 0;
  for (let i = 0; i < sortedSleep.length; i++) {
    if (sortedSleep[i].duration >= 7 * 60) {
      streak++;
      if (streak >= 3) {
        await addAchievement(masterList.find((a) => a.type === "SleepStreak3"));
        break;
      }
    } else {
      streak = 0;
    }
  }
}

module.exports = { checkAchievements };
