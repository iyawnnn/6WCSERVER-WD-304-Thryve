const { body } = require("express-validator");

exports.createWorkoutValidator = [
  body("type")
    .notEmpty()
    .withMessage("Workout type is required")
    .isString()
    .withMessage("Workout type must be a string")
    .matches(/^[A-Za-z\s\-]+$/)
    .withMessage("Workout type must contain only letters and spaces"),

  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isFloat({ gt: 0 })
    .withMessage("Duration must be greater than 0"),

  body("calories")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Calories cannot be negative"),

  body("timestamp")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Timestamp must be a valid date"),
];
