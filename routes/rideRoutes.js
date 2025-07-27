const express = require('express');
const router = express.Router();
const axios = require('axios');
const Ride = require('../models/Ride');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Driver = require('../models/Driver');
require('dotenv').config();
// Book ride
router.post('/book', auth('user'), async (req, res) => {
    const existingRide = await Ride.findOne({ userId: req.userId, status: 'Pending' });
    if (existingRide) return res.status(400).json({ error: 'You already have a pending ride' });

      const user = await User.findById(req.userId);

    const { pickupAddress, dropAddress, pickupCoords, dropCoords, totalDistance, totalPrice, vehicleType,phone } = req.body;

    const ride = await Ride.create({
        userId: req.userId,
        pickupAddress,
        dropAddress,
        pickupCoords,
        dropCoords,
        status: 'Pending',
        totalDistance,
        totalPrice,
        vehicleType,
        phone
    });

    res.json({ msg: 'Ride booked', rideId: ride._id });
});



// Driver fetches all relevant rides
router.get('/all', auth('driver','admin'), async (req, res) => {
    const rides = await Ride.find({
        $or: [
            { status: 'Pending' },
            { status: 'Accepted', driverId: req.userId },
            { status: 'Rejected', driverId: req.userId },
            { status: 'Completed', driverId: req.userId }
        ]
    })
    .populate('userId', 'phone name')
    .select('pickupAddress dropAddress status userId driverId otp totalDistance totalPrice vehicleType createdAt phone');

    res.json(rides);
});

// Accept ride
// Accept ride
router.post('/accept/:rideId', auth('driver', 'admin'), async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);
  if (!ride || ride.status !== 'Pending') {
    return res.status(400).json({ error: 'Ride is cancelled by the rider' });
  }

  ride.driverId = req.userId;
  ride.status = 'Accepted';
  ride.otp = Math.floor(1000 + Math.random() * 9000).toString();
  await ride.save();

  const io = req.app.get('io');
  const userSockets = req.app.get('userSockets');
  const userSocketId = userSockets.get(ride.userId.toString());
  const user = await User.findById(ride.userId);

  let driverPhone = "N/A";

  // 👇 If phone is sent from frontend (e.g., admin's phone), use it
  if (req.body.phone) {
    driverPhone = req.body.phone;
  } else {
    const driver = await Driver.findById(req.userId);
    if (driver) {
      driverPhone = driver.phone;
    }
  }

  // ✅ Send ride accepted event to user
  if (userSocketId) {
    io.to(userSocketId).emit('ride_accepted', {
      rideId: ride._id,
      otp: ride.otp,
      driverPhone: driverPhone,
    });
  }

  res.json({ msg: 'Ride accepted', ride, userPhone: user?.phone || null });
});


// Reject ride
router.post('/reject/:rideId', auth('driver','admin'), async (req, res) => {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride || ride.status !== 'Pending') return res.status(400).json({ error: 'Ride is cancelled by the rider' });

    ride.status = 'Rejected';
    ride.driverId = req.userId;
    await ride.save();

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const userSocketId = userSockets.get(ride.userId.toString());

    if (userSocketId) {
        io.to(userSocketId).emit('ride_rejected', { rideId: ride._id });
    }

    res.json({ msg: 'Ride rejected' });
});

// Complete ride
router.post('/complete/:rideId', auth('driver','admin'), async (req, res) => {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (ride.driverId?.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    ride.status = 'Completed';
    await ride.save();

    res.json({ msg: 'Ride marked as completed' });
});

// Delete ride
router.delete('/delete/:rideId', auth('driver','admin'), async (req, res) => {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (ride.driverId?.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    await ride.deleteOne();
    res.json({ msg: 'Ride deleted permanently' });
});

// User ride history
router.get('/my', auth('user'), async (req, res) => {
    const rides = await Ride.find({ userId: req.userId });
    res.json(rides);
});

router.get("/distance", async (req, res) => {
  const { pickupLat, pickupLng, dropLat, dropLng } = req.query;

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${dropLat},${dropLng}&key=${apiKey}`;

    console.log("Calling Distance API with URL:", url);

    const response = await axios.get(url);
    console.log("Distance API Response:", response.data);

    res.json(response.data);
  } catch (err) {
    console.error("Distance Calculation Failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to calculate distance" });
  }
});
// User cancels ride if still pending
router.post('/cancel/:rideId', auth('user'), async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);
  if (!ride || ride.status !== 'Pending' || ride.userId.toString() !== req.userId) {
    return res.status(400).json({ error: "Cannot cancel this ride" });
  }

  const io = req.app.get('io');
  const driverSockets = req.app.get('driverSockets');

  if (ride.driverId) {
    const driverSocketId = driverSockets.get(ride.driverId.toString());
    if (driverSocketId) {
      io.to(driverSocketId).emit('ride_cancelled_by_user', { rideId: ride._id });
    }
  }

  await ride.deleteOne();
  res.json({ msg: "Ride cancelled" });
});






module.exports = router;
