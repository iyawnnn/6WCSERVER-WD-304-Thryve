const Workout = require("../models/Workout");

exports.createWorkout = async (req, res) => {
  try {
    const { type, duration, calories, date } = req.body;

    const workout = new Workout({
      type,
      duration,
      calories,
      date,
      userId: req.user.userId,
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.userId }).sort({ timestamp: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const { type, duration, calories, date } = req.body;
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { type, duration, calories, date },
      { new: true }
    );
    if (!workout) return res.status(404).json({ error: "Workout not found" });
    res.json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!workout) return res.status(404).json({ error: "Workout not found" });
    res.json({ message: "Workout deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

