const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
