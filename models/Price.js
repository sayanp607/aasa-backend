const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  activity: String, // new field
  value: Number
});

module.exports = mongoose.model('Price', PriceSchema);
