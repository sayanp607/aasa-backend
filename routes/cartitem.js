// routes/cart.js
const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const userFromHeader = require('../middlewares/userFromHeader');
router.post('/add', userFromHeader, async (req, res) => {
  const { activity, date, guests, pricePerHead } = req.body;
  const totalGuests = guests.length;
  const totalPrice = totalGuests * pricePerHead;

  const existing = new CartItem({
    userId: req.user.id,
    activity,
    date,
    guests,
    totalGuests,
    pricePerHead,
    totalPrice
  });
  await existing.save();
  res.json({ success: true, cartId: existing._id });
});

router.get('/',userFromHeader, async (req, res) => {
  const items = await CartItem.find({ userId: req.user.id });
  res.json(items);
});

module.exports = router;
