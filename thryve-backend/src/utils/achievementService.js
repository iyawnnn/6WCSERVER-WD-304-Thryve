const mongoose = require("mongoose");
const UserAchievement = require("../models/UserAchievement");
const MasterAchievement = require("../models/MasterAchievement");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");
const Water = require("../models/WaterLog");
const Sleep = require("../models/SleepLog");

/**
 * Check and award achievements for a user
 * Fetches master list from MasterAchievement collection
 */
async function checkAchievements(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Helper to add achievement if not already earned
  const addAchievement = async (type, iconUrl) => {
    const normalizedType = type.trim().toLowerCase();

    try {
      const exists = await UserAchievement.findOne({
        userId: userObjectId,
        type: { $regex: `^${normalizedType}$`, $options: "i" }, // case-insensitive
      });
      if (exists) return;

      await UserAchievement.create({
        userId: userObjectId,
        type: normalizedType,
        iconUrl,
      });
      console.log(`Achievement unlocked: ${type}`);
    } catch (err) {
      console.error("Error adding achievement:", err);
    }
  };

  // Fetch master list
  const masterList = await MasterAchievement.find({}).lean();

  // === First Workout ===
  const workoutCount = await Workout.countDocuments({ userId: userObjectId });
  if (workoutCount >= 1) {
    const master = masterList.find((a) => a.type === "FirstWorkout");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // === Five Meals ===
  const mealCount = await Meal.countDocuments({ userId: userObjectId });
  if (mealCount >= 5) {
    const master = masterList.find((a) => a.type === "FiveMeals");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // === 7-Day Streak ===
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days

  const meals = await Meal.find({
    userId: userObjectId,
    date: { $gte: sevenDaysAgo },
  });
  const workouts = await Workout.find({
    userId: userObjectId,
    date: { $gte: sevenDaysAgo },
  });

  const loggedDates = new Set(
    [...meals, ...workouts].map((e) => e.date.toDateString())
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
    const master = masterList.find((a) => a.type === "Streak7Days");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // === 1000 Calories Burned ===
  const totalCalories = await Workout.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: "$calories" } } },
  ]);

  if (totalCalories[0]?.total >= 1000) {
    const master = masterList.find((a) => a.type === "Calories1000");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // ==== HYDRATION ====
  const waterCount = await Water.countDocuments({ userId: userObjectId }); // assume Water model exists
  if (waterCount >= 5) {
    const master = masterList.find((a) => a.type === "Hydration5");
    if (master) await addAchievement(master.type, master.iconUrl);
  }
  if (waterCount >= 20) {
    const master = masterList.find((a) => a.type === "Hydration20");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // ==== SLEEP ====
  const sleepLogs = await Sleep.find({ userId: userObjectId }); // assume Sleep model exists
  for (const log of sleepLogs) {
    if (log.duration >= 7 * 60) {
      // 7 hours
      const master = masterList.find((a) => a.type === "Sleep7");
      if (master) await addAchievement(master.type, master.iconUrl);
    }
  }

  // 3-day sleep streak of 7+ hours
  const sortedSleep = sleepLogs.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  let streak = 0;
  for (let i = 0; i < sortedSleep.length; i++) {
    if (sortedSleep[i].duration >= 7 * 60) streak++;
    else streak = 0;
    if (streak >= 3) {
      const master = masterList.find((a) => a.type === "SleepStreak3");
      if (master) await addAchievement(master.type, master.iconUrl);
      break;
    }
  }

  // ==== WORKOUT 10 ====
  if (workoutCount >= 10) {
    const master = masterList.find((a) => a.type === "Workout10");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // ==== CALORIES 5000 ====
  if (totalCalories[0]?.total >= 5000) {
    const master = masterList.find((a) => a.type === "Calories5000");
    if (master) await addAchievement(master.type, master.iconUrl);
  }
}

module.exports = { checkAchievements };
