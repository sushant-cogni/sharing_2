const Favourite = require("../models/Favourite");

const addFavourite = async (userId, bookData) => {
  const existing = await Favourite.findOne({ userId, bookId: bookData.bookId });
  if (existing) throw new Error("Book already in favourites");
  const fav = await Favourite.create({ userId, ...bookData });
  return fav;
};

const removeFavourite = async (userId, bookId) => {
  const fav = await Favourite.findOneAndDelete({ userId, bookId });
  if (!fav) throw new Error("Favourite not found");
  return { message: "Removed from favourites" };
};

const getFavourites = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Favourite.countDocuments({ userId });
  const favourites = await Favourite.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return { favourites, total, page, totalPages: Math.ceil(total / limit) };
};

const checkFavourite = async (userId, bookId) => {
  const exists = await Favourite.findOne({ userId, bookId });
  return { isFavourite: !!exists };
};

module.exports = {
  addFavourite,
  removeFavourite,
  getFavourites,
  checkFavourite,
};
