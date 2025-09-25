const { body } = require("express-validator");

exports.createMealValidator = [
  body("foodName")
    .notEmpty()
    .withMessage("Food name is required")
    .isString()
    .withMessage("Food name must be a string")
    .matches(/^[A-Za-z\s\-]+$/)
    .withMessage("Food name must contain only letters, spaces, or hyphens"),

  body("calories")
    .notEmpty()
    .withMessage("Calories are required")
    .isFloat({ min: 1 })
    .withMessage("Calories must be 1 or higher"),

  body("protein")
    .optional() 
    .isFloat({ min: 0 })
    .withMessage("Protein must be 0 or higher"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .toDate()
    .withMessage("Date must be a valid date")
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(value);
      inputDate.setHours(0, 0, 0, 0);

      if (inputDate > today) {
        throw new Error("Date cannot be in the future");
      }
      return true;
    }),
];
