const express = require('express');
const router = express.Router();
const DateSlot = require('../models/DateSlot');
const Price = require('../models/Price');

router.get('/dates', async (req, res) => {
  const { activity } = req.query;
  const dates = await DateSlot.find({ activity });
  res.json(dates);
});


// ADD date with activity
router.post('/dates', async (req, res) => {
  const { date, activity } = req.body;
  const newSlot = new DateSlot({ date, activity });
  await newSlot.save();
  res.json({ success: true });
});

router.delete('/dates/:id', async (req, res) => {
  const { activity } = req.query;

  const deleted = await DateSlot.findOneAndDelete({ _id: req.params.id, activity });

  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Date slot not found for the specified activity.' });
  }
});


// Get current price
router.get('/price', async (req, res) => {
  const { activity } = req.query;
  const priceDoc = await Price.findOne({ activity });
  res.json(priceDoc || { value: 0 });
});

// Set or update price
router.post('/price', async (req, res) => {
  const { value, activity } = req.body;
  let priceDoc = await Price.findOne({ activity });
  if (priceDoc) {
    priceDoc.value = value;
    await priceDoc.save();
  } else {
    priceDoc = new Price({ value, activity });
    await priceDoc.save();
  }
  res.json({ success: true });
});

module.exports = router;
