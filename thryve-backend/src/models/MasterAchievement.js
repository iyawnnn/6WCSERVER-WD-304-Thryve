const mongoose = require("mongoose");

const masterAchievementSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  iconUrl: { type: String, required: true },
  description: { type: String, required: true }, 
});

module.exports = mongoose.model("MasterAchievement", masterAchievementSchema);
