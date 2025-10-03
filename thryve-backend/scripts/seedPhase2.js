require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/User'); 
const Workout = require('../../models/Workout');
const Meal = require('../../models/Meal');
const bcrypt = require('bcryptjs');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: 'demo@thryve.test' });
  if (!user) {
    const passwordHash = await bcrypt.hash('password123', 10); 
    user = await User.create({ name: 'Demo User', email: 'demo@thryve.test', password: passwordHash });
    console.log('Created demo user', user._id.toString());
  }
  const uId = user._id;

  await Workout.deleteMany({ userId: uId });
  await Meal.deleteMany({ userId: uId });

  await Workout.insertMany([
    { userId: uId, type: 'Running', duration: 30, calories: 300, timestamp: new Date() },
    { userId: uId, type: 'Cycling', duration: 45, calories: 400, timestamp: new Date(Date.now() - 1000*60*60*24) }
  ]);

  await Meal.insertMany([
    { userId: uId, foodName: 'Chicken Salad', calories: 350, timestamp: new Date() },
    { userId: uId, foodName: 'Rice + Chicken', calories: 600, timestamp: new Date(Date.now() - 1000*60*60*6) }
  ]);

  console.log('Seed complete for user', uId.toString());
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
