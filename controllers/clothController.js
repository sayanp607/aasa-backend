const Cloth = require('../models/Cloth');
const redis = require('../config/redis');

// ✅ Create Cloth (with multiple sizes)
exports.createCloth = async (req, res) => {
  try {
    const { name, description } = req.body;
    const sizes = JSON.parse(req.body.sizes); // sizes comes as string from formData
    const image = req.file ? req.file.filename : null;

    const cloth = new Cloth({
      name,
      description,
      sizes,
      image
    });

    await cloth.save();
    
    // ⚡ Invalidate Cache
    await redis.del('cloths:/api/admin/cloth/public/all');
    
    res.status(201).json(cloth);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ✅ Get All Cloths
exports.getAllCloths = async (req, res) => {
  try {
    const cloths = await Cloth.find();
    res.json(cloths);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ✅ Update Cloth
exports.updateCloth = async (req, res) => {
  try {
    const cloth = await Cloth.findById(req.params.id);
    if (!cloth) {
      return res.status(404).json({ message: 'Cloth not found' });
    }

    cloth.name = req.body.name;
    cloth.description = req.body.description;
    cloth.sizes = JSON.parse(req.body.sizes);

    if (req.file) {
      cloth.image = req.file.filename;
    }

    await cloth.save();

    // ⚡ Invalidate Cache
    await redis.del('cloths:/api/admin/cloth/public/all');

    res.json({ message: 'Cloth updated', cloth });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


// ✅ Delete Cloth
exports.deleteCloth = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cloth.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Cloth not found' });
    }

    // ⚡ Invalidate Cache
    await redis.del('cloths:/api/admin/cloth/public/all');

    res.json({ message: 'Cloth deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
