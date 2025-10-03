const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  try {
    await mongoose.connect(mongoUri); 
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
