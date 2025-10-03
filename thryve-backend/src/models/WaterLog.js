const mongoose = require('mongoose');

const WaterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  totalAmount: { type: Number, required: true, default: 0 },
  entries: [
    {
      time: { type: String }, // "08:30"
      amount: { type: Number }
    }
  ]
});

// Compound index for fast queries per user per day
WaterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WaterLog', WaterLogSchema);
