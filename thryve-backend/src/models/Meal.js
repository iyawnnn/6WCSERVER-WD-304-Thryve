const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 }, 
  date: { type: Date, required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Compound index
mealSchema.index({ userId: 1, date: -1 }); 

module.exports = mongoose.model("Meal", mealSchema);
