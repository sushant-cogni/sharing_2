const {
  addRecommendation,
  removeRecommendation,
  getAllRecommendations,
} = require("../services/recommendationService");

const add = async (req, res) => {
  try {
    const rec = await addRecommendation(req.user.id, req.body);
    res.status(201).json(rec);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await removeRecommendation(req.user.id, req.params.bookId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await getAllRecommendations(page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { add, remove, getAll };
