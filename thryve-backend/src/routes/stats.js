router.get("/today", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const today = new Date().toISOString().slice(0, 10);

  const caloriesToday = await Meal.aggregate([
    { $match: { userId: req.user.id, date: today } },
    { $group: { _id: null, total: { $sum: "$calories" } } }
  ]);

  const workoutMinutesToday = await Workout.aggregate([
    { $match: { userId: req.user.id, date: today } },
    { $group: { _id: null, total: { $sum: "$minutes" } } }
  ]);

  const calories = caloriesToday[0]?.total || 0;
  const workoutMinutes = workoutMinutesToday[0]?.total || 0;

  res.json({
    calories,
    workoutMinutes,
    goals: {
      calories: user.dailyCaloriesGoal,
      workoutMinutes: user.dailyWorkoutMinutesGoal,
    },
    progress: {
      calories: ((calories / user.dailyCaloriesGoal) * 100).toFixed(0),
      workoutMinutes: ((workoutMinutes / user.dailyWorkoutMinutesGoal) * 100).toFixed(0),
    }
  });
});
