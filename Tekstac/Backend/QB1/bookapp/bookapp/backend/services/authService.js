const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// Register a new user
const registerUser = async (name, email, password) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const user = await User.create({ name, email, password });

  // Send welcome email (non-blocking)
  sendEmail(email, name).catch((err) =>
    console.error("Email error:", err.message),
  );

  return { message: "Registration successful! Please login." };
};

// Login user and return token
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = generateToken(user._id);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

// Get user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

module.exports = { registerUser, loginUser, getUserById };
