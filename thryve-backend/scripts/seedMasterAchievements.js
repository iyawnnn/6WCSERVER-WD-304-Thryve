const mongoose = require("mongoose");
const MasterAchievement = require("../src/models/MasterAchievement");
require('dotenv').config();

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
    description: "Work out or log meals 7 days straight",
    iconUrl: "/icons/7-day-streak.png",
  },
  {
    type: "Calories1000",
    name: "1000 Calories Burned",
    description: "Burn 1000 calories total",
    iconUrl: "/icons/1000-calories.png",
  },
  {
    type: "Hydration5",
    name: "Hydration Novice",
    description: "Drink at least 5 glasses of water",
    iconUrl: "/icons/water5.png",
    criteria: { waterCount: 5 },
  },
  {
    type: "Hydration20",
    name: "Hydration Expert",
    description: "Drink 20 glasses of water total",
    iconUrl: "/icons/water20.png",
    criteria: { waterCount: 20 },
  },
  {
    type: "Sleep7",
    name: "Sleepy Head",
    description: "Sleep 7+ hours in a night",
    iconUrl: "/icons/sleep7.png",
    criteria: { sleepHours: 7 },
  },
  {
    type: "SleepStreak3",
    name: "Dream Team",
    description: "Sleep 7+ hours for 3 nights in a row",
    iconUrl: "/icons/sleep-streak3.png",
    criteria: { sleepStreak: 3 },
  },
  {
    type: "Workout10",
    name: "Getting Stronger",
    description: "Complete 10 workouts",
    iconUrl: "/icons/workout10.png",
    criteria: { workoutCount: 10 },
  },
  {
    type: "Calories5000",
    name: "Calorie Crusher",
    description: "Burn 5000 calories total",
    iconUrl: "/icons/calories5000.png",
    criteria: { calories: 5000 },
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

    console.log("Master achievements seeded/updated");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
