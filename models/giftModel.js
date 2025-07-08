const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: {
    type: String,
    enum: ['Corporate Gifts', 'Personalised Gifts', 'Birthday Gifts', 'Anniversary Gifts'],
    required: true
  },
  stock: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Gift', giftSchema);
