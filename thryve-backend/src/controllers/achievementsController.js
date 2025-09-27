const MasterAchievement = require("../models/MasterAchievement");
const UserAchievement = require("../models/UserAchievement");

exports.getMasterList = async (req, res) => {
  const list = await MasterAchievement.find({}).sort({ type: 1 }).lean();
  res.json(list);
};

exports.getUserAchievements = async (req, res) => {
  const userId = req.params.userId;
  const achievements = await UserAchievement.find({ userId }).lean();
  res.json(achievements);
};
