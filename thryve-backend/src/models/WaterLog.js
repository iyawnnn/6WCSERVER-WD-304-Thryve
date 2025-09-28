const mongoose = require('mongoose');

const WaterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // indexed for fast queries
  date: { type: String, required: true }, // YYYY-MM-DD
  amount: { type: Number, required: true }, // in ml
}, { timestamps: true });

// Compound index for fast queries per user per day
WaterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WaterLog', WaterLogSchema);
