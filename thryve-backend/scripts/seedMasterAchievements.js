const mongoose = require("mongoose");
const MasterAchievement = require("../src/models/MasterAchievement");
const achievementsData = [
  {
    type: "FirstWorkout",
    name: "First Workout",
    description: "Complete your first workout",
    iconUrl: "/icons/first-workout.png",
    criteria: { workoutCount: 1 },
  },
  {
    type: "FiveMeals",
    name: "Five Meals",
    description: "Log 5 meals",
    iconUrl: "/icons/five-meals.png",
    criteria: { mealCount: 5 },
  },
  {
    type: "Streak7Days",
    name: "7-Day Streak",
    description: "Workout or log meals 7 days in a row",
    iconUrl: "/icons/7-day-streak.png",
  },
  {
    type: "Calories1000",
    name: "1000 Calories Burned",
    description: "Burn 1000 calories in total",
    iconUrl: "/icons/1000-calories.png",
  },
];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to DB");

    for (const ach of achievementsData) {
      await MasterAchievement.updateOne(
        { type: ach.type },
        { $set: ach },
        { upsert: true }
      );
    }

    console.log("Master achievements seeded");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
