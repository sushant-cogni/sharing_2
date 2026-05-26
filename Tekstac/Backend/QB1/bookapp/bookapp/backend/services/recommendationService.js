const Recommendation = require("../models/Recommendation");

const addRecommendation = async (userId, bookData) => {
  const existing = await Recommendation.findOne({
    userId,
    bookId: bookData.bookId,
  });
  if (existing) throw new Error("You already recommended this book");
  const rec = await Recommendation.create({ userId, ...bookData });
  return rec;
};

const removeRecommendation = async (userId, bookId) => {
  const rec = await Recommendation.findOneAndDelete({ userId, bookId });
  if (!rec) throw new Error("Recommendation not found");
  return { message: "Recommendation removed" };
};

// All users' recommendations (global list)
const getAllRecommendations = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Recommendation.countDocuments();
  const recommendations = await Recommendation.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return { recommendations, total, page, totalPages: Math.ceil(total / limit) };
};

module.exports = {
  addRecommendation,
  removeRecommendation,
  getAllRecommendations,
};
