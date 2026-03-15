const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: String,
  location: String,
  region: String,
  category: { type: String, default: 'Trek' },
  difficulty: { type: String, default: 'Medium' },
  price: Number,
  discountPrice: Number,
  image: String,
  description: String,
  firecamp: { type: Boolean, default: false },
  tentStay: { type: Boolean, default: false },
  foodAndNightlife: { type: Boolean, default: false },
  itinerary: [{
    day: String,
    title: String,
    description: String
  }],
  availableDates: [String],
  reviews: [{
    name: String,
    rating: Number,
    comment: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
