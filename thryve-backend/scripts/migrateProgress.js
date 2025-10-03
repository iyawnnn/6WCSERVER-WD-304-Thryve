const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Meal = require("../src/models/Meal");
const Workout = require("../src/models/Workout");
const Progress = require("../src/models/Progress");

async function migrateProgress() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB");

    // Clear existing progress (optional)
    // await Progress.deleteMany({});
    // console.log("Cleared existing Progress documents");

    // Get all users from meals and workouts
    const meals = await Meal.find({});
    const workouts = await Workout.find({});

    // Map: { userId -> { dateString -> { calories, protein, workoutMinutes } } }
    const progressMap = {};

    // Process meals
    meals.forEach((meal) => {
      const userId = meal.userId.toString();
      const dateStr = new Date(meal.date).toISOString().slice(0, 10);

      if (!progressMap[userId]) progressMap[userId] = {};
      if (!progressMap[userId][dateStr]) {
        progressMap[userId][dateStr] = { calories: 0, protein: 0, workoutMinutes: 0 };
      }

      progressMap[userId][dateStr].calories += meal.calories;
      progressMap[userId][dateStr].protein += meal.protein;
    });

    // Process workouts
    workouts.forEach((workout) => {
      const userId = workout.userId.toString();
      const dateStr = new Date(workout.date).toISOString().slice(0, 10);

      if (!progressMap[userId]) progressMap[userId] = {};
      if (!progressMap[userId][dateStr]) {
        progressMap[userId][dateStr] = { calories: 0, protein: 0, workoutMinutes: 0 };
      }

      progressMap[userId][dateStr].workoutMinutes += workout.duration;
    });

    const progressDocs = [];
    for (const userId in progressMap) {
      for (const dateStr in progressMap[userId]) {
        const { calories, protein, workoutMinutes } = progressMap[userId][dateStr];
        progressDocs.push({
          userId,
          date: new Date(dateStr),
          caloriesConsumed: calories,
          proteinConsumed: protein,
          workoutMinutes,
        });
      }
    }

    if (progressDocs.length > 0) {
      await Progress.insertMany(progressDocs);
      console.log(`Inserted ${progressDocs.length} Progress documents`);
    } else {
      console.log("No data to migrate");
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateProgress();
