const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: { type: String, required: true },
    title: { type: String, required: true },
    authors: [String],
    thumbnail: String,
    description: String,
    publishedDate: String,
    language: String,
  },
  { timestamps: true },
);

recommendationSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);
