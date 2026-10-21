const Order = require('../models/orderModel');
const User = require('../models/User');
const Gift = require('../models/giftModel'); 
const Cloth = require('../models/Cloth');
const Shipping = require('../models/shippingModel');
const { sendNotification } = require('../utils/emailService');
const { purgeClothCache, purgeGiftCache } = require('../utils/cacheHelper');

exports.createOrder = async (req, res) => {
  try {
    const { clothId, amount, paymentId, shippingId, quantity, size } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cloth = await Cloth.findById(clothId);
    if (!cloth) {
      return res.status(404).json({ message: 'Cloth not found' });
    }

    const sizeObj = cloth.sizes.find(sz => sz.size === size);
    if (!sizeObj) {
      return res.status(400).json({ message: 'Selected size not available' });
    }

    if (sizeObj.stock < quantity) {
      return res.status(400).json({ message: `Only ${sizeObj.stock} items available for size ${size}` });
    }

    // 1. Atomic Stock Decrement
    const updatedCloth = await Cloth.findOneAndUpdate(
      { _id: clothId, "sizes.size": size, "sizes.stock": { $gte: quantity } },
      { $inc: { "sizes.$.stock": -quantity } },
      { new: true }
    );

    if (!updatedCloth) {
      return res.status(400).json({ message: 'Stock update failed. Possibly out of stock.' });
    }

    // 2. Create Order
    const newOrder = await Order.create({
      userId,
      cloth: clothId,
      size,
      amount,
      paymentId,
      shippingId,
      quantity 
    });

    await newOrder.populate('userId cloth');

    // 📧 Direct Email Notification
    sendNotification('CLOTH_ORDER', newOrder).catch((e) => {
      console.error('⚠️ [Email] Failed to send cloth order notification:', e.message);
    });
    
    // ⚡ Invalidate Public Cloth Cache (safe no-op if redis disabled)
    await purgeClothCache();

    // 4. Return Success
    res.json({ message: 'Order created successfully', order: newOrder });

  } catch (err) {
    console.error("Global Order Error:", err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate('cloth')
      .populate('gift')
      .populate('shippingId');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId')
      .populate('cloth')
      .populate('gift')
      .populate('shippingId');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// ✅ Update order status (same)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Ordered', 'Packing', 'Delivered', 'Delivery' , 'Out for delivery'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

exports.createGiftOrder = async (req, res) => {
  try {
    const { giftId, amount, paymentId, shippingId, quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const gift = await Gift.findById(giftId);
    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    if (gift.stock < quantity) {
      return res.status(400).json({ message: `Only ${gift.stock} items available` });
    }

    // 1. Atomic Gift Stock Decrement
    const updatedGift = await Gift.findOneAndUpdate(
      { _id: giftId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!updatedGift) {
      return res.status(400).json({ message: 'Gift stock update failed. Possibly out of stock.' });
    }

    // 2. Create Order
    const newOrder = await Order.create({
      userId,
      gift: giftId,
      amount,
      paymentId,
      shippingId,
      quantity
    });

    await newOrder.populate('userId gift');

    // 📧 Direct Email Notification
    sendNotification('GIFT_ORDER', newOrder).catch((e) => {
      console.error('⚠️ [Email] Failed to send gift order notification:', e.message);
    });

    // ⚡ Invalidate Public Gift Cache (safe no-op if redis disabled)
    await purgeGiftCache();

    res.json({ message: 'Gift order created successfully', order: newOrder });

  } catch (err) {
    console.error("Global Gift Order Error:", err);
    res.status(500).json({ message: 'Failed to create gift order', error: err.message });
  }
};
