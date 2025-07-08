const express = require('express');
const router = express.Router();
const {
  addGift,
  getAllGifts,
  getGiftsByCategory,
  editGift,
  deleteGift,searchGifts,reduceGiftStock
} = require('../controllers/giftController');
const upload = require('../middlewares/upload');

// Admin APIs
router.post('/add', upload.single('image'),addGift); // Add Gift
router.put('/edit/:id',upload.single('image'), editGift); // Edit Gift
router.delete('/delete/:id', deleteGift); // Delete Gift

// Public APIs
router.get('/', getAllGifts); // Get all gifts
router.get('/category/:category', getGiftsByCategory); // Gifts by category
router.get('/search', searchGifts);
router.put('/reduce-stock/:id', reduceGiftStock);

module.exports = router;
