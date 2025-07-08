const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

router.post('/register', async (req, res) => {
    const { name, email, phone, vehicleType, vehicleNumber, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const driver = await Driver.create({ name, email, phone, vehicleType, vehicleNumber, password: hashed });
        res.json({ msg: 'Driver registered', driver });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (driver && await bcrypt.compare(password, driver.password)) {
        const token = jwt.sign({ id: driver._id, role: 'driver' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, driver });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;
