const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: String,
  location: String,
  region: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Difficult'] },
  price: Number,
  discountPrice: Number,
  image: String,
  description: String,
  firecamp: Boolean,
  tentStay: Boolean,
  foodAndNightlife: Boolean,
  availableDates: [String],
  reviews: [{
    name: String,
    rating: Number,
    comment: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
