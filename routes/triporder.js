const express = require('express');
const router = express.Router();
const Order = require('../models/TripOrder');
const authMiddleware = require('../middlewares/userFromHeader');

const nodemailer = require('nodemailer');

// Universal order placement (Support both / and /place)
const handleOrderPlacement = async (req, res) => {
  const { item, billingInfo, totalAmount, userId } = req.body;
  
  const finalUserId = userId || (req.user ? req.user.id : null);

  const newOrder = new Order({
    userId: finalUserId,
    item,
    billingInfo,
    totalAmount
  });

  try {
    await newOrder.save();

    // Confirmation Email Logic
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sayanp607@gmail.com',
        pass: 'rxgf hxea gzcn iudm'
      }
    });

    const mailOptions = {
      from: 'sayanp607@gmail.com',
      to: billingInfo.email,
      subject: `Expedition Confirmed: ${item.activity}`,
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f8fafc;">
          <h1 style="color: #10b981;">Mission Confirmed!</h1>
          <p>Hi ${billingInfo.firstName}, your space on the <strong>${item.activity}</strong> has been secured.</p>
          <div style="background: white; padding: 15px; border-radius: 10px;">
            <p><strong>Deployment Date:</strong> ${new Date(item.date).toDateString()}</p>
            <p><strong>Crew Size:</strong> ${item.totalGuests} Members</p>
            <p><strong>Total Investment:</strong> ₹${totalAmount}</p>
          </div>
          <p>Prepare for the journey. Intelligence briefings will follow.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions).catch(e => console.error("Email failed but order recorded"));
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: "Mission failure: " + err.message });
  }
};

router.post('/', handleOrderPlacement);
router.post('/place', authMiddleware, handleOrderPlacement);

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
