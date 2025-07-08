const Gift = require('../models/giftModel');

// Add a new gift
exports.addGift = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
const image = req.file ? `/uploads/${req.file.filename}` : null;


    const gift = new Gift({ name, description, price, category, stock, image });
    await gift.save();

    res.status(201).json(gift);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add gift', error: err.message });
  }
};

// Get all gifts
exports.getAllGifts = async (req, res) => {
  try {
    const gifts = await Gift.find();
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get gifts by category
exports.getGiftsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const gifts = await Gift.find({ category });
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit gift
exports.editGift = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const updatedData = { name, description, price, category, stock };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const gift = await Gift.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    res.status(200).json(gift);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update gift', error: err.message });
  }
};


// Delete gift
exports.deleteGift = async (req, res) => {
  try {
    const gift = await Gift.findByIdAndDelete(req.params.id);
    if (!gift) return res.status(404).json({ message: 'Gift not found' });
    res.status(200).json({ message: 'Gift deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete gift', error: err.message });
  }
};

// Get gifts by category
exports.getGiftsByCategory = async (req, res) => {
  try {
    const gifts = await Gift.find({ category: req.params.category });
    res.status(200).json(gifts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gifts', error: err.message });
  }
};

// Search gifts within category
exports.searchGifts = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q || !category) {
      return res.status(400).json({ message: 'Query and category are required' });
    }

    const regex = new RegExp(q, 'i'); // case-insensitive match
    const gifts = await Gift.find({ name: regex, category });

    res.status(200).json(gifts);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

exports.reduceGiftStock = async (req, res) => {
  const { quantity } = req.body;
  try {
    const gift = await Gift.findById(req.params.id);
    if (!gift) return res.status(404).json({ message: 'Gift not found' });

    if (gift.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    gift.stock -= quantity;
    await gift.save();
    res.json({ message: 'Stock updated', gift });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update stock', error: err.message });
  }
};
