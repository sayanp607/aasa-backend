const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');

// Get cart items for a specific user
router.get('/', async (req, res) => {
  try {
    const userData = JSON.parse(req.headers['x-user-data']);
    const userId = userData.id || userData._id;
    const items = await CartItem.find({ userId });
    res.json(items);
  } catch (err) {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// Add item to cart (Support both legacy and new /add)
const addToCart = async (req, res) => {
  try {
    const item = new CartItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

router.post('/', addToCart);
router.post('/add', addToCart);

// Remove cart item
router.delete('/:id', async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Removed' });
});

module.exports = router;
