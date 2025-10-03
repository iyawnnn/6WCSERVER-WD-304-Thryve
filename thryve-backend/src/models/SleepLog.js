const mongoose = require("mongoose");

const sleepLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true }, // date of wake-up
    bedTime: { type: Date, required: true },
    wakeTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("SleepLog", sleepLogSchema);
