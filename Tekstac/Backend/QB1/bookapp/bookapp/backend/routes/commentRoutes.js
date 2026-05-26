const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { add, get, remove } = require('../controllers/commentController');

router.get('/:bookId', get);        // public - anyone can read
router.post('/', protect, add);     // auth required
router.delete('/:id', protect, remove); // auth required

module.exports = router;