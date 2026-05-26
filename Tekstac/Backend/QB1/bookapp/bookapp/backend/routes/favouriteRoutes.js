const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  add,
  remove,
  getAll,
  check,
} = require("../controllers/favouriteController");

router.use(protect); // all routes need auth

router.get("/", getAll);
router.post("/", add);
router.get("/check/:bookId", check);
router.delete("/:bookId", remove);

module.exports = router;
