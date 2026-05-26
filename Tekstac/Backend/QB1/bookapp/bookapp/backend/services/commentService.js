const Comment = require("../models/Comment");

const addComment = async (bookId, userId, userName, text) => {
  const comment = await Comment.create({ bookId, userId, userName, text });
  return comment;
};

const getComments = async (bookId) => {
  return await Comment.find({ bookId }).sort({ createdAt: -1 });
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");
  if (comment.userId.toString() !== userId) throw new Error("Not authorized");
  await comment.deleteOne();
  return { message: "Comment deleted" };
};

module.exports = { addComment, getComments, deleteComment };
