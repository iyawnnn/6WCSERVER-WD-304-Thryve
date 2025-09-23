const Meal = require("../models/Meal");

exports.createMeal = async (req, res) => {
  try {
    const { foodName, calories, date } = req.body;

    const meal = new Meal({
      foodName,
      calories,
      date,
      userId: req.user.userId, // ✅ use userId
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user.userId }).sort({
      date: -1, // ✅ use date
    });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId }, // must match both
      req.body,
      { new: true }
    );

    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json({ message: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
