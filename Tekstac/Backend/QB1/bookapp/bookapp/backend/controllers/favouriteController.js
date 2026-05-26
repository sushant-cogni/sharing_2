const {
  addFavourite,
  removeFavourite,
  getFavourites,
  checkFavourite,
} = require("../services/favouriteService");

const add = async (req, res) => {
  try {
    const fav = await addFavourite(req.user.id, req.body);
    res.status(201).json(fav);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await removeFavourite(req.user.id, req.params.bookId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await getFavourites(req.user.id, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const check = async (req, res) => {
  try {
    const result = await checkFavourite(req.user.id, req.params.bookId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { add, remove, getAll, check };
