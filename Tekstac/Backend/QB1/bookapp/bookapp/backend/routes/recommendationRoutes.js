const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  add,
  remove,
  getAll,
} = require("../controllers/recommendationController");

router.get("/", protect, getAll);
router.post("/", protect, add);
router.delete("/:bookId", protect, remove);

module.exports = router;
