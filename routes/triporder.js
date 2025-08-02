const express = require('express');
const router = express.Router();
const Order = require('../models/TripOrder');
const authMiddleware = require('../middlewares/userFromHeader');

const nodemailer = require('nodemailer');

router.post('/place', authMiddleware, async (req, res) => {
  const { item, billingInfo } = req.body;
  const userId = req.user.id;

  const newOrder = new Order({
    userId,
    item,
    billingInfo
  });

  await newOrder.save();

  // Send confirmation email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sayanp607@gmail.com',     // replace with your email
      pass: 'rxgf hxea gzcn iudm'         // use an App Password
    }
  });

  const mailOptions = {
    from: 'sayanp607@gmail.com',
    to: billingInfo.email,
    subject: `Order Confirmation - ${item.activity}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Hi ${billingInfo.firstName},</p>
      <p>Your booking for <strong>${item.activity}</strong> on <strong>${item.date}</strong> has been successfully placed.</p>
      <p>Total Guests: ${item.guests.length}</p>
      <p>You will be contacted shortly with further details.</p>
      <p>Regards,<br/>Adventure Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: "Order placed and email sent" });
  } catch (emailErr) {
    console.error("Email sending failed:", emailErr);
    res.status(201).json({ message: "Order placed, but email failed" });
  }
});


// User’s order history
router.get('/my-orders', authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
});

// Admin - all orders
router.get('/all-orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

module.exports = router;
