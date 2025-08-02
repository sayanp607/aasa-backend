const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

// Get all trips
router.get('/trips', async (req, res) => {
  const trips = await Trip.find();
  res.json(trips);
});

// Get single trip by ID
router.get('/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID' });
  }
});

// Add new trip
router.post('/trips', async (req, res) => {
  try {
    const newTrip = new Trip(req.body);
    await newTrip.save();
    res.status(201).json({ message: 'Trip created', trip: newTrip });
  } catch (err) {
    res.status(400).json({ message: 'Error creating trip', error: err });
  }
});

// Update trip
router.put('/trips/:id', async (req, res) => {
  try {
    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Trip updated', updated });
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err });
  }
});

// Delete trip
router.delete('/trips/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed', error: err });
  }
});

module.exports = router;
