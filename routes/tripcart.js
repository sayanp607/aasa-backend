const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');

// Get all cart items
router.get('/', async (req, res) => {
  const items = await CartItem.find();
  res.json(items);
});

// Add item to cart
router.post('/', async (req, res) => {
  const item = new CartItem(req.body);
  item.totalPrice = item.pricePerUser * item.quantity;
  await item.save();
  res.status(201).json(item);
});

// Remove cart item
router.delete('/:id', async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Removed' });
});

module.exports = router;
