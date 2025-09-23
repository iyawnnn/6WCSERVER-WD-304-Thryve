
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const workoutsRouter = require('./routes/workout');
const mealsRoutes = require("./routes/meals");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET','POST','PUT','DELETE']
}));

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/auth', authLimiter);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, version: '0.1.0' }));

// Routes
app.use('/api/auth', authRoutes);

// Protected placeholder dashboard
const authMiddleware = require('./middleware/authMiddleware');
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ message: 'Protected route OK', userId: req.user.userId });
});

app.use('/api/workouts', workoutsRouter);
app.use("/api/meals", mealsRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
