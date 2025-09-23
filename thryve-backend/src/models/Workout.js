const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  type: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 },
  calories: { type: Number, required: true, min: 1 },
  date: { type: Date, required: true }, // add this
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// Index
workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Workout", workoutSchema);
