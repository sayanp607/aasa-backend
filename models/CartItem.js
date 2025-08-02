// models/CartItem.js
const mongoose = require('mongoose');
const CartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  activity: { type: String, required: true },
  date: { type: String, required: true },
  guests: [{ title: String, name: String }],
  totalGuests: Number,
  pricePerHead: Number,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('CartItem', CartItemSchema);
