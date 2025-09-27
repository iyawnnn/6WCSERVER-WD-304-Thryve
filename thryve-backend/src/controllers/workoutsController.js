const mongoose = require("mongoose");
const Workout = require("../models/Workout");
const Progress = require("../models/Progress");
const { checkAchievements } = require('../utils/achievementService');

// Helper to update workout progress
async function updateWorkoutProgress(userId, workout, increment = true) {
  const multiplier = increment ? 1 : -1;

  const date = new Date(workout.date);
  date.setHours(0, 0, 0, 0);

  await Progress.findOneAndUpdate(
    { userId, date },
    { $inc: { workoutMinutes: workout.duration * multiplier } },
    { upsert: true, new: true }
  );
}

// CREATE a workout
exports.createWorkout = async (req, res) => {
  try {
    const { type, duration, calories, date } = req.body;

    if (!type) throw new Error("Workout type is required");
    if (!duration || duration <= 0) throw new Error("Duration must be greater than 0");

    const workout = new Workout({
      type,
      duration,
      calories,
      date,
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });

    await workout.save();

    // Update daily progress
    await updateWorkoutProgress(req.user.userId, workout, true);

    // Check achievements
    await checkAchievements(req.user.userId);

    res.status(201).json(workout);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// GET all workouts for logged-in user
exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE a workout
exports.updateWorkout = async (req, res) => {
  try {
    const oldWorkout = await Workout.findById(req.params.id);

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!workout) return res.status(404).json({ error: "Workout not found" });

    // Update progress: subtract old workout, add new workout
    await updateWorkoutProgress(req.user.userId, oldWorkout, false);
    await updateWorkoutProgress(req.user.userId, workout, true);

    res.json(workout);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE a workout
exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!workout) return res.status(404).json({ error: "Workout not found" });

    // Update progress: remove workout contribution
    await updateWorkoutProgress(req.user.userId, workout, false);

    res.json({ message: "Workout deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
