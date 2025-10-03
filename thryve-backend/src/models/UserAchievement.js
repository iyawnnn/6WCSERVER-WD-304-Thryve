const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
}, {
  collection: 'userAchievements' // <-- exact collection name in Atlas
});

userAchievementSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
