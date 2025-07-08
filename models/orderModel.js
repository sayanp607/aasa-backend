const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Reference to cloth or gift (only one will be used per order)
  cloth: { type: mongoose.Schema.Types.ObjectId, ref: 'Cloth' },
  gift: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },

  size: { type: String }, // Only used for cloth
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  shippingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipping', required: true },
  status: { type: String, default: 'Paid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
