const Order = require("../models/Order");

const nodemailer = require("nodemailer");

const createOrder = async (req, res) => {
  try {
    const imagePath = req.file ? req.file.filename : null;

    const pickup = JSON.parse(req.body.pickup);
    const delivery = JSON.parse(req.body.delivery);

    const newOrder = await Order.create({
      ...req.body,
      pickup,
      delivery,
      image: imagePath,
      user: req.user.id,
      notifyRecipient: req.body.notifyRecipient === "true",  // Ensure it's boolean
    });

    const { producer } = require("../config/kafka");

    // 🚀 Kafka Event: Emit "DELIVERY_SCHEDULED" (Always emit for logging/admin)
    try {
      await producer.send({
        topic: 'aasa-orders',
        messages: [{ value: JSON.stringify({ type: 'DELIVERY_SCHEDULED', data: newOrder }) }],
      });
      console.log('📡 [Kafka] DELIVERY_SCHEDULED event emitted');
    } catch (kErr) {
      console.error('⚠️ [Kafka] Failed to emit delivery event:', kErr.message);
    }

    res.json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    await order.save();

    const { producer } = require("../config/kafka");

    // 🚀 Kafka Event: Emit "DELIVERY_STATUS_UPDATED"
    try {
      await producer.send({
        topic: 'aasa-orders',
        messages: [{ value: JSON.stringify({ type: 'DELIVERY_STATUS_UPDATED', data: order }) }],
      });
      console.log('📡 [Kafka] DELIVERY_STATUS_UPDATED event emitted');
    } catch (kErr) {
      console.error('⚠️ [Kafka] Failed to emit status update event:', kErr.message);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    if (order.status !== "Pending" && order.status !== "Assigned")
      return res.status(400).json({ message: "Only Pending or Assigned orders can be deleted" });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    if (order.status !== "Pending" && order.status !== "Assigned")
      return res.status(400).json({ message: "Only Pending or Assigned orders can be edited" });

    const allowedFields = [
      "pickup",
      "delivery",
      "deliveryType",
      "scheduleTime",
      "packageWeight",
      "itemType",
      "parcelValue",
      "senderPhone",
      "notifyRecipient",
      "price",
      "image"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    await order.save();
    res.json({ message: "Order updated successfully", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { createOrder, getAllOrders, updateOrderStatus, getMyOrders, deleteOrder,updateOrder };
