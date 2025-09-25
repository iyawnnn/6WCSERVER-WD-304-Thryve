const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const authMiddleware = require("../middleware/authMiddleware");

const { createMealValidator } = require("../validators/mealValidator");
const { validationResult } = require("express-validator");
const { createMeal, getMeals, updateMeal, deleteMeal } = require("../controllers/mealsController");

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Create a meal (POST /api/meals)
router.post(
  "/", 
  authMiddleware, 
  createMealValidator,
  handleValidation,
  createMeal
);

// Get all meals for logged-in user (GET /api/meals)
router.get("/", authMiddleware, getMeals);

// Update a meal (PUT /api/meals/:id) with validator
router.put(
  "/:id",
  authMiddleware,
  createMealValidator,  // reuse validator
  handleValidation,     // check validation
  updateMeal            // controller
);

// Delete a meal (DELETE /api/meals/:id)
router.delete("/:id", authMiddleware, deleteMeal);

module.exports = router;
