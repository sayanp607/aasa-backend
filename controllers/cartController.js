const User = require('../models/User');
const Cloth = require('../models/Cloth');
const Gift = require('../models/giftModel');
// Add to Cart
exports.addToCart = async (req, res) => {
  const { userId, clothId } = req.body;

  try {
    const user = await User.findById(userId);
    const cloth = await Cloth.findById(clothId);

    if (!user || !cloth) {
      return res.status(404).json({ message: 'User or Product not found' });
    }

    // Check if already exists in cart
    const isAlreadyInCart = user.cart.some(item => item.clothId.equals(clothId));

    if (isAlreadyInCart) {
      return res.status(200).json({ message: 'Item already added in cart', alreadyExists: true });
    }

    // Add to cart
    user.cart.push({ clothId });
    await user.save();

    res.status(200).json({ message: 'Added to cart', alreadyExists: false, cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// Get Cart
exports.getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('cart.clothId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Remove Item
exports.removeFromCart = async (req, res) => {
  const { userId, clothId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { clothId } }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addGiftToCart = async (req, res) => {
  const { userId, giftId } = req.body;

  try {
    const user = await User.findById(userId);
    const gift = await Gift.findById(giftId);

    if (!user || !gift) {
      return res.status(404).json({ message: 'User or Gift not found' });
    }

    const alreadyInCart = user.giftCart.some(item => item.giftId.equals(giftId));
    if (alreadyInCart) {
      return res.status(200).json({ message: 'Gift already in cart', alreadyExists: true });
    }

    user.giftCart.push({ giftId });
    await user.save();

    res.status(200).json({ message: 'Gift added to cart', alreadyExists: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Gift Cart
exports.getGiftCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('giftCart.giftId');
    res.json(user.giftCart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove Gift
exports.removeGiftFromCart = async (req, res) => {
  const { userId, giftId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { giftCart: { giftId } }
    });

    res.json({ message: 'Gift removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
