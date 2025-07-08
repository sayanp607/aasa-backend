const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: { type: String, enum: ['XS','S','M','L','XL','2XL','3XL','4XL','5XL'], required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 }  // <-- new field
});

const clothSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  sizes: [sizeSchema],
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cloth', clothSchema);
