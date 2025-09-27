require("dotenv").config(); 
const mongoose = require("mongoose");
const Progress = require("../src/models/Progress");

async function mergeDuplicates() {
  const all = await Progress.aggregate([
    {
      $group: {
        _id: {
          userId: "$userId",
          date: { $dateTrunc: { date: "$date", unit: "day" } }, // truncate to day
        },
        docs: { $push: "$$ROOT" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const item of all) {
    const { docs } = item;
    const merged = docs.reduce(
      (acc, doc) => {
        acc.caloriesConsumed += doc.caloriesConsumed;
        acc.proteinConsumed += doc.proteinConsumed;
        acc.workoutMinutes += doc.workoutMinutes;
        return acc;
      },
      { caloriesConsumed: 0, proteinConsumed: 0, workoutMinutes: 0 }
    );

    // keep first doc, update totals
    const firstDoc = docs[0];
    await Progress.findByIdAndUpdate(firstDoc._id, merged);

    // remove the rest
    for (let i = 1; i < docs.length; i++) {
      await Progress.findByIdAndDelete(docs[i]._id);
    }
  }

  console.log("Duplicates merged");
}

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not set in .env");

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
    await mergeDuplicates();
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

main();
