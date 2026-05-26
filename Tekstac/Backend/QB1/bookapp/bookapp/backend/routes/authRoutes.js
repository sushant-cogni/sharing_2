const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  login,
);

router.get("/profile", protect, getProfile);

module.exports = router;
