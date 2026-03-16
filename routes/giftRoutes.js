const express = require('express');
const router = express.Router();
const {
  addGift,
  getAllGifts,
  getGiftsByCategory,
  editGift,
  deleteGift, searchGifts, reduceGiftStock
} = require('../controllers/giftController');
const upload = require('../middlewares/upload');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Admin APIs
router.post('/add', upload.single('image'), addGift); // Add Gift
router.put('/edit/:id', upload.single('image'), editGift); // Edit Gift
router.delete('/delete/:id', deleteGift); // Delete Gift

// Public APIs
router.get('/', cacheMiddleware('gifts', 3600), getAllGifts); // Get all gifts
router.get('/category/:category', cacheMiddleware('gifts', 3600), getGiftsByCategory); // Gifts by category
router.get('/search', cacheMiddleware('gifts', 3600), searchGifts);
router.put('/reduce-stock/:id', reduceGiftStock);

module.exports = router;
