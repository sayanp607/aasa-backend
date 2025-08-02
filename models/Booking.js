const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  name: String,
  phone: String,
  bookingDate: Date,
  selectedDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
