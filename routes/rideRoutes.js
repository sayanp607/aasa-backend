const express = require('express');
const router = express.Router();
const axios = require('axios');
const Ride = require('../models/Ride');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { producer } = require('../config/kafka'); // ✅ Import Kafka
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

    // 🚀 Kafka Event: Emit "RIDE_BOOKED"
    try {
        await producer.send({
            topic: 'aasa-orders',
            messages: [{ value: JSON.stringify({ type: 'RIDE_BOOKED', data: ride }) }],
        });
        console.log('📡 [Kafka] RIDE_BOOKED event emitted');
    } catch (kErr) {
        console.error('⚠️ [Kafka] Failed to emit ride booking event:', kErr.message);
    }

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

  // ✅ Send ride accepted event to user room (works across instances)
  io.to(`user:${ride.userId}`).emit('ride_accepted', {
    rideId: ride._id,
    otp: ride.otp,
    driverPhone: driverPhone,
  });

  // 🚀 Kafka Event: Emit "RIDE_ACCEPTED"
  try {
    await producer.send({
        topic: 'aasa-orders',
        messages: [{ value: JSON.stringify({ 
            type: 'RIDE_ACCEPTED', 
            data: { ...ride._doc, driverPhone } 
        }) }],
    });
    console.log('📡 [Kafka] RIDE_ACCEPTED event emitted');
  } catch (kErr) {
    console.error('⚠️ [Kafka] Failed to emit ride accepted event:', kErr.message);
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

    // 🚀 Kafka Event: Emit "RIDE_REJECTED"
    try {
        await producer.send({
            topic: 'aasa-orders',
            messages: [{ value: JSON.stringify({ type: 'RIDE_REJECTED', data: ride }) }],
        });
    } catch (kErr) {
        console.error('⚠️ [Kafka] Failed to emit ride rejection event:', kErr.message);
    }

    const io = req.app.get('io');
    io.to(`user:${ride.userId}`).emit('ride_rejected', { rideId: ride._id });

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

    // 🚀 Kafka Event: Emit "RIDE_COMPLETED"
    try {
        await producer.send({
            topic: 'aasa-orders',
            messages: [{ value: JSON.stringify({ type: 'RIDE_COMPLETED', data: ride }) }],
        });
    } catch (kErr) {
        console.error('⚠️ [Kafka] Failed to emit ride completion event:', kErr.message);
    }

    // 🚀 Socket Event: Notify User Room
    const io = req.app.get('io');
    io.to(`user:${ride.userId}`).emit('ride_completed', { rideId: ride._id });

    res.json({ msg: 'Ride marked as completed' });
});

// Submit Feedback
router.patch('/feedback/:rideId', auth('user'), async (req, res) => {
    const { rating, feedback } = req.body;
    const ride = await Ride.findById(req.params.rideId);

    if (!ride || ride.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized or ride not found' });
    }

    if (ride.status !== 'Completed') {
      return res.status(400).json({ error: 'Can only provide feedback for completed rides' });
    }

    ride.feedback = feedback;
    await ride.save();

    // 🚀 Kafka Event: Emit "RIDE_FEEDBACK_SUBMITTED"
    try {
        await producer.send({
            topic: 'aasa-orders',
            messages: [{ value: JSON.stringify({ type: 'RIDE_FEEDBACK_SUBMITTED', data: ride }) }],
        });
    } catch (kErr) {
        console.error('⚠️ [Kafka] Failed to emit feedback event:', kErr.message);
    }

    res.json({ msg: 'Feedback submitted successfully', ride });
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

// Helper: Haversine distance in km
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1.3; // 1.3 road curvature factor
}

router.get("/distance", async (req, res) => {
  const { pickupLat, pickupLng, dropLat, dropLng } = req.query;

  if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  const pLat = parseFloat(pickupLat);
  const pLng = parseFloat(pickupLng);
  const dLat = parseFloat(dropLat);
  const dLng = parseFloat(dropLng);

  try {
    // 1. Try Free OpenStreetMap OSRM Road Routing
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=false`;
    const osrmRes = await axios.get(osrmUrl, { timeout: 4000 });

    if (osrmRes.data?.routes?.[0]) {
      const distanceMeters = osrmRes.data.routes[0].distance;
      const durationSeconds = osrmRes.data.routes[0].duration;
      const km = (distanceMeters / 1000).toFixed(1);
      const mins = Math.max(1, Math.round(durationSeconds / 60));

      return res.json({
        rows: [{
          elements: [{
            status: "OK",
            distance: { text: `${km} km`, value: Math.round(distanceMeters) },
            duration: { text: `${mins} mins`, value: Math.round(durationSeconds) }
          }]
        }]
      });
    }
  } catch (osrmErr) {
    console.warn("OSRM routing unavailable, using Haversine calculation:", osrmErr.message);
  }

  // 2. High-precision Haversine Fallback
  const km = parseFloat(calculateHaversineDistance(pLat, pLng, dLat, dLng).toFixed(1));
  const meters = Math.round(km * 1000);
  const estimatedMins = Math.max(1, Math.round(km * 2.5)); // ~25km/h avg speed

  res.json({
    rows: [{
      elements: [{
        status: "OK",
        distance: { text: `${km} km`, value: meters },
        duration: { text: `${estimatedMins} mins`, value: estimatedMins * 60 }
      }]
    }]
  });
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

  // 🚀 Kafka Event: Emit "RIDE_CANCELLED"
  try {
    await producer.send({
      topic: 'aasa-orders',
      messages: [{ value: JSON.stringify({ type: 'RIDE_CANCELLED', data: ride }) }],
    });
    console.log('📡 [Kafka] RIDE_CANCELLED event emitted');
  } catch (kErr) {
    console.error('⚠️ [Kafka] Failed to emit ride cancellation event:', kErr.message);
  }

  res.json({ msg: "Ride cancelled" });
});






module.exports = router;
