const mongoose = require("mongoose");
const UserAchievement = require("../models/UserAchievement");
const MasterAchievement = require("../models/MasterAchievement");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");

/**
 * Check and award achievements for a user
 * Fetches master list from MasterAchievement collection
 */
async function checkAchievements(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Helper to add achievement if not already earned
  const addAchievement = async (type, iconUrl) => {
    try {
      const exists = await UserAchievement.findOne({ userId: userObjectId, type });
      if (exists) return;

      await UserAchievement.create({ userId: userObjectId, type, iconUrl });
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
    const master = masterList.find(a => a.type === "FirstWorkout");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // === Five Meals ===
  const mealCount = await Meal.countDocuments({ userId: userObjectId });
  if (mealCount >= 5) {
    const master = masterList.find(a => a.type === "FiveMeals");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // === 7-Day Streak ===
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days

  const meals = await Meal.find({ userId: userObjectId, date: { $gte: sevenDaysAgo } });
  const workouts = await Workout.find({ userId: userObjectId, date: { $gte: sevenDaysAgo } });

  const loggedDates = new Set([...meals, ...workouts].map(e => e.date.toDateString()));

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
    const master = masterList.find(a => a.type === "Streak7Days");
    if (master) await addAchievement(master.type, master.iconUrl);
  }

  // === 1000 Calories Burned ===
  const totalCalories = await Workout.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: "$calories" } } },
  ]);

  if (totalCalories[0]?.total >= 1000) {
    const master = masterList.find(a => a.type === "Calories1000");
    if (master) await addAchievement(master.type, master.iconUrl);
  }
}

module.exports = { checkAchievements };
