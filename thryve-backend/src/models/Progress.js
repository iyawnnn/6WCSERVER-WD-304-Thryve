const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // day of progress
  caloriesConsumed: { type: Number, default: 0 },
  proteinConsumed: { type: Number, default: 0 },
  workoutMinutes: { type: Number, default: 0 },
}, {
  timestamps: true
});

// Compound index to prevent duplicate progress entries per day
progressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
