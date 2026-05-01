const { body, param, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateSignup = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("email")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  handleValidationErrors,
];

const validateSignin = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateRating = [
  body("movieId")
    .isInt({ min: 1 }).withMessage("movieId must be a positive integer"),
  body("score")
    .isFloat({ min: 0, max: 5 }).withMessage("Score must be between 0 and 5"),
  handleValidationErrors,
];

const validateComment = [
  body("movieId")
    .isInt({ min: 1 }).withMessage("movieId must be a positive integer"),
  body("content")
    .optional()
    .isString().withMessage("Content must be a string")
    .isLength({ max: 500 }).withMessage("Content must be at most 500 characters"),
  body("imageUrl")
    .optional()
    .isURL().withMessage("imageUrl must be a valid URL"),
  handleValidationErrors,
];

const validateUpdateUser = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .optional()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateSignin,
  validateRating,
  validateComment,
  validateUpdateUser,
};
