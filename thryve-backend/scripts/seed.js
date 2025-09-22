
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seed = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/thryve', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Example seed user
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      age: 25,
      weight: 70,
      height: 175
    });

    await user.save();
    console.log("Seed user created:", user);

    await mongoose.disconnect();
    console.log("Disconnected");
  } catch (err) {
    console.error("Error seeding:", err.message);
  }
};

seed();
