const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add to Cart
router.post('/add', cartController.addToCart);

// Get Cart
router.get('/:userId', cartController.getCart);

// Remove from Cart
router.delete('/remove', cartController.removeFromCart);

router.post('/add-gift', cartController.addGiftToCart);
router.get('/gift/:userId', cartController.getGiftCart);
router.delete('/remove-gift', cartController.removeGiftFromCart);

module.exports = router;
