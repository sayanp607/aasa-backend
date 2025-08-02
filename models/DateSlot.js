const mongoose = require('mongoose');

const DateSlotSchema = new mongoose.Schema({
  activity: String, // new field
  date: String
});

module.exports = mongoose.model('DateSlot', DateSlotSchema);
