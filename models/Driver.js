const mongoose = require('mongoose');
const driverSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    vehicleType: String,
    vehicleNumber: String,
    password: String,
    isAvailable: { type: Boolean, default: false }
});
module.exports = mongoose.model('Driver', driverSchema);
