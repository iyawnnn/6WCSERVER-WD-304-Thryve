const { createWorkoutValidator } = require("../validators/workoutValidator");
const { createWorkout, getWorkouts, updateWorkout, deleteWorkout } = require("../controllers/workoutsController");
const authMiddleware = require("../middleware/authMiddleware"); // correct import
const { validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Apply authMiddleware only on routes that require it
router.post("/", authMiddleware, createWorkoutValidator, handleValidation, createWorkout);
router.get("/", authMiddleware, getWorkouts);
router.put("/:id", authMiddleware, updateWorkout);
router.delete("/:id", authMiddleware, deleteWorkout);

module.exports = router;
