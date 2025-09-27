const Meal = require("../models/Meal");
const Progress = require("../models/Progress");
const { checkAchievements } = require('../utils/achievementService');

// Helper to update progress when meals change
async function updateMealProgress(userId, meal, increment = true) {
  const multiplier = increment ? 1 : -1;

  const date = new Date(meal.date);
  date.setHours(0, 0, 0, 0); // normalize to start of day

  await Progress.findOneAndUpdate(
    { userId, date },
    {
      $inc: {
        caloriesConsumed: meal.calories * multiplier,
        proteinConsumed: meal.protein * multiplier
      }
    },
    { upsert: true, new: true }
  );
}

// CREATE a meal
exports.createMeal = async (req, res) => {
  try {
    const { foodName, calories, protein = 0, date } = req.body;

    if (!foodName) throw new Error("Food name is required");

    const meal = new Meal({
      foodName,
      calories,
      protein,
      date,
      userId: req.user.userId,
    });

    await meal.save();

    // Update daily progress
    await updateMealProgress(req.user.userId, meal, true);

    // Check achievements
    await checkAchievements(req.user.userId);

    res.status(201).json(meal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// GET all meals for the logged-in user
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user.userId }).sort({
      date: -1, // latest first
    });
    res.json(meals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE a meal
exports.updateMeal = async (req, res) => {
  try {
    const oldMeal = await Meal.findById(req.params.id);

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!meal) return res.status(404).json({ error: "Meal not found" });

    // Update progress: subtract old meal, add new meal
    await updateMealProgress(req.user.userId, oldMeal, false);
    await updateMealProgress(req.user.userId, meal, true);

    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE a meal
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!meal) return res.status(404).json({ error: "Meal not found" });

    // Update progress: remove meal contribution
    await updateMealProgress(req.user.userId, meal, false);

    res.json({ message: "Meal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
