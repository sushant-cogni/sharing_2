const {
  addComment,
  getComments,
  deleteComment,
} = require("../services/commentService");

const add = async (req, res) => {
  const { bookId, text } = req.body;
  if (!bookId || !text)
    return res.status(400).json({ message: "bookId and text are required" });
  try {
    const comment = await addComment(bookId, req.user.id, req.user.name, text);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const get = async (req, res) => {
  try {
    const comments = await getComments(req.params.bookId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteComment(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res
      .status(err.message === "Not authorized" ? 403 : 404)
      .json({ message: err.message });
  }
};

module.exports = { add, get, remove };
