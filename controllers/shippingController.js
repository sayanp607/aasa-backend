const Shipping = require('../models/shippingModel');

exports.createShipping = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, country } = req.body;

    const newShipping = await Shipping.create({
      userId, fullName, phone, addressLine1, addressLine2, city, state, pincode, country
    });

    res.json({ message: 'Shipping saved', shipping: newShipping });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save shipping', error: err.message });
  }
};
