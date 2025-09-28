// Core imports
const express = require('express');
const helmet = require('helmet'); // Security middleware (sets secure HTTP headers)
const cors = require('cors'); // Cross-Origin Resource Sharing (allow frontend to call backend)
const morgan = require('morgan'); // HTTP request logger
const rateLimit = require('express-rate-limit'); // Prevents brute force / spam requests
const path = require('path');

// Route imports
const authRoutes = require('./routes/auth');
const workoutsRouter = require('./routes/workout');
const mealsRoutes = require('./routes/meals');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');
const achievementsRoutes = require('./routes/achievements');
const progressRoutes = require('./routes/progress');
const masterAchievementsRoutes = require('./routes/masterAchievement');
const waterRoutes = require('./routes/water'); 
const sleepRoutes = require("./routes/sleep"); 

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// ====== CONFIGURATION ====== //
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Security middleware
app.use(helmet()); // Adds basic security headers
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan('dev')); // Logs requests in dev format

// CORS setup (restricts who can access API)
app.use(cors({
  origin: FRONTEND_ORIGIN, // Only allow requests from frontend
  methods: ['GET','POST','PUT','DELETE']
}));

// ====== RATE LIMITING ====== //
// Protect auth routes (e.g. login/register) from brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Limit each IP to 100 requests per window
});
app.use('/api/auth', authLimiter);

// ====== HEALTH CHECK ====== //
app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: '0.1.0' });
});

// ====== ROUTES ====== //
// Authentication (login, register, etc.)
app.use('/api/auth', authRoutes);

// Dashboard (protected route - requires valid JWT)
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ message: 'Protected route OK', userId: req.user.userId });
});

// Workouts CRUD
app.use('/api/workouts', workoutsRouter);

// Meals CRUD
app.use('/api/meals', mealsRoutes);

// Extended dashboard (stats, summaries, etc.)
app.use('/api/dashboard', dashboardRoutes);

// User-related routes (profile, settings, etc.)
app.use('/api/users', userRoutes);

// Achievements (milestones, streaks, etc.)
app.use('/api/achievements', achievementsRoutes);

// Progress tracking (daily logs, summaries, etc.)
app.use('/api/progress', progressRoutes);

// Master Achievements (list of all possible achievements)
app.use('/api/master-achievements', masterAchievementsRoutes);

// Water intake logging and retrieval
app.use('/api/water', waterRoutes);

// Sleep tracking routes
app.use("/api/sleep", sleepRoutes);

// ====== ERROR HANDLING ====== //
app.use(errorHandler);

module.exports = app;
