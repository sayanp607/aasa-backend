const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

router.get('/', async (req, res) => {
  const trips = await Trip.find();
  res.json(trips);
});

router.get('/:id', async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  res.json(trip);
});

// POST /api/trips/search - filter trips
router.post('/search', async (req, res) => {
  const { region, difficulty, date } = req.body;
  let filter = {};

  if (region) filter.region = region;
  if (difficulty) filter.difficulty = difficulty;
  if (date) {
    const selectedDate = new Date(date);
    filter.availableDates = { $elemMatch: { $eq: selectedDate } };
  }

  try {
    const trips = await Trip.find(filter);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Failed to filter trips' });
  }
});


module.exports = router;
