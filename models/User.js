const mongoose = require('mongoose');

// Super simple cartItemSchema now:
const cartItemSchema = new mongoose.Schema({
  clothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cloth', required: true }
});
const giftCartItemSchema = new mongoose.Schema({
  giftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift', required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
   phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  cart: [cartItemSchema],
  giftCart: [giftCartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
