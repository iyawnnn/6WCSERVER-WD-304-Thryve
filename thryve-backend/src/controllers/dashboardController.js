const mongoose = require("mongoose");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");
const User = require("../models/User");
const Preferences = require("../models/Preferences");
const Progress = require("../models/Progress");

// Helpers
const toDateString = (d) => d.toISOString().slice(0, 10);
const startOfDayUTC = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};
const endOfDayUTC = (d) => {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
};

// NEW: compute start-of-week in UTC
const startOfWeekUTC = (date, weekStartDay = 0) => {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sunday, 1=Monday, etc.
  const diff = (day - weekStartDay + 7) % 7;
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

// helper: normalize user id
const castUserId = (payload) => {
  const idStr = payload && (payload.userId || payload.id || payload._id);
  if (!idStr) return null;
  try {
    return new mongoose.Types.ObjectId(idStr);
  } catch (e) {
    return idStr;
  }
};

// -------------------- TODAY --------------------
exports.getToday = async (req, res, next) => {
  try {
    const userIdObj = castUserId(req.user);
    if (!userIdObj) return res.status(400).json({ error: "Invalid user id" });

    const start = startOfDayUTC(new Date());
    const end = endOfDayUTC(new Date());

    // Aggregate today's workouts and meals
    const [workAgg, mealAgg] = await Promise.all([
      Workout.aggregate([
        { $match: { userId: userIdObj, date: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: null,
            totalCalories: { $sum: "$calories" },
            totalMinutes: { $sum: "$duration" }, // <-- workout minutes
          },
        },
      ]),
      Meal.aggregate([
        { $match: { userId: userIdObj, date: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: null,
            totalCalories: { $sum: "$calories" },
            totalProtein: { $sum: "$protein" },
          },
        },
      ]),
    ]);

    const caloriesBurned = workAgg[0]?.totalCalories || 0;
    const workoutMinutes = workAgg[0]?.totalMinutes || 0;
    const caloriesEaten = mealAgg[0]?.totalCalories || 0;
    const proteinEaten = mealAgg[0]?.totalProtein || 0;
    const net = caloriesEaten - caloriesBurned;

    // Fetch goals from UserSettings
    const settings = await Preferences.findOne({ userId: userIdObj }).lean();
    const goals = {
      calories: settings?.dailyCaloriesGoal || 0,
      protein: settings?.dailyProteinGoal || 0,
      workoutMinutes: settings?.dailyWorkoutMinutesGoal || 0,
    };

    // Progress calculations
    const progress = {
      calories: goals.calories ? Math.round((caloriesEaten / goals.calories) * 100) : 0,
      protein: goals.protein ? Math.round((proteinEaten / goals.protein) * 100) : 0,
      workoutMinutes: goals.workoutMinutes ? Math.round((workoutMinutes / goals.workoutMinutes) * 100) : 0,
    };

    return res.json({
      caloriesBurned,
      caloriesEaten,
      workoutMinutes,
      proteinEaten,
      net,
      goals,
      progress: {
        calories: Math.min(progress.calories, 100),
        protein: Math.min(progress.protein, 100),
        workoutMinutes: Math.min(progress.workoutMinutes, 100),
      },
    });
  } catch (err) {
    console.error("Dashboard error (getToday):", err);
    next(err);
  }
};

// -------------------- WEEKLY --------------------
exports.getWeekly = async (req, res, next) => {
  try {
    const userIdObj = castUserId(req.user);
    if (!userIdObj) return res.status(400).json({ error: "Invalid user id" });

    // fetch user's preference
    const userDoc = await User.findById(userIdObj).select("weekStart").lean();
    const weekStartPref = userDoc?.weekStart || "Sunday";
    const weekStartDay = weekStartPref === "Monday" ? 1 : 0;

    // compute week range
    const weekStartDate = startOfWeekUTC(new Date(), weekStartDay);
    const weekEndDate = endOfDayUTC(
      new Date(weekStartDate.getTime() + 6 * 24 * 3600 * 1000)
    );

    const [workoutsAgg, mealsAgg] = await Promise.all([
      Workout.aggregate([
        {
          $match: {
            userId: userIdObj,
            date: { $gte: weekStartDate, $lte: weekEndDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCalories: { $sum: "$calories" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Meal.aggregate([
        {
          $match: {
            userId: userIdObj,
            date: { $gte: weekStartDate, $lte: weekEndDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCalories: { $sum: "$calories" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const mapAgg = (arr) =>
      arr.reduce((acc, cur) => {
        acc[cur._id] = cur.totalCalories;
        return acc;
      }, {});
    const wMap = mapAgg(workoutsAgg);
    const mMap = mapAgg(mealsAgg);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setUTCDate(weekStartDate.getUTCDate() + i);
      const dayStr = toDateString(d);
      days.push({
        day: dayStr,
        burned: wMap[dayStr] || 0,
        eaten: mMap[dayStr] || 0,
      });
    }

    const avgBurned = Math.round(
      days.reduce((s, x) => s + x.burned, 0) / 7 || 0
    );
    const avgEaten = Math.round(days.reduce((s, x) => s + x.eaten, 0) / 7 || 0);
    const peakBurned = days.reduce((a, b) => (b.burned > a.burned ? b : a), {
      burned: -1,
    });
    const peakEaten = days.reduce((a, b) => (b.eaten > a.eaten ? b : a), {
      eaten: -1,
    });

    return res.json({
      data: days,
      meta: {
        avgBurned,
        avgEaten,
        peakBurnedDay: peakBurned.day,
        peakEatenDay: peakEaten.day,
        weekStart: weekStartPref,
        weekRange: { start: days[0].day, end: days[6].day },
      },
    });
  } catch (err) {
    console.error("Dashboard error (getWeekly):", err);
    next(err);
  }
};

// -------------------- HIGHLIGHTS --------------------
exports.getHighlights = async (req, res, next) => {
  try {
    const userIdObj = castUserId(req.user);
    if (!userIdObj) return res.status(400).json({ error: "Invalid user id" });

    const [longWorkoutsCount, smallMealsCount, avgDurationAgg] =
      await Promise.all([
        Workout.countDocuments({ userId: userIdObj, duration: { $gt: 30 } }),
        Meal.countDocuments({ userId: userIdObj, calories: { $lt: 500 } }),
        Workout.aggregate([
          { $match: { userId: userIdObj } },
          { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
        ]),
      ]);

    const avgDuration =
      avgDurationAgg && avgDurationAgg[0]
        ? Math.round(avgDurationAgg[0].avgDuration)
        : 0;

    return res.json({
      workoutsOver30Min: longWorkoutsCount,
      mealsUnder500Cal: smallMealsCount,
      avgWorkoutDuration: avgDuration,
    });
  } catch (err) {
    console.error("Dashboard error (getHighlights):", err);
    next(err);
  }
};
