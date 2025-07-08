const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    pickupAddress: String,
    dropAddress: String,
    pickupCoords: {
        lat: Number,
        lng: Number
    },
    dropCoords: {
        lat: Number,
        lng: Number
    },
    status: { type: String, default: 'Pending' }, // Pending, Accepted, Rejected, Started, Completed
    totalDistance:Number,
    totalPrice:Number,
    vehicleType:String,
    otp: { type: String, default: '' },
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', rideSchema);
