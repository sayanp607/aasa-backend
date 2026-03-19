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
    phone: String,
    otp: String,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
