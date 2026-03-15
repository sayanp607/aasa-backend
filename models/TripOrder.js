const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: Object,
  billingInfo: {
    firstName: String,
    lastName: String,
    address: String,
    phone: String,
    email: String
  },
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TripOrder", OrderSchema);
