const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST: /api/bookings
router.post('/', async (req, res) => {
  const { tripId, name, phone, selectedDate } = req.body;

  if (!tripId || !name || !phone || !selectedDate) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const newBooking = new Booking({
      tripId,
      name,
      phone,
      selectedDate: new Date(selectedDate)
    });
    await newBooking.save();
    res.status(201).json({ message: 'Booking confirmed', booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

module.exports = router;
