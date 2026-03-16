const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redis = require('../config/redis');

router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, phone, password: hashed });

        res.json({ msg: 'User registered', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const cacheKey = `auth:creds:${email}`;

    try {
        // ⚡ Fast Auth: Check Redis first
        const cachedUser = await redis.get(cacheKey);
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            if (await bcrypt.compare(password, user.password)) {
                console.log(`🚀 [Fast Auth] Verified via Redis: ${email}`);
                const token = jwt.sign({ id: user.id || user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return res.json({ token, user });
            }
        }

        // 🐢 Standard Auth: Fetch from MongoDB
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            // ✅ Store in Redis for "Fast Login" next time
            await redis.setex(cacheKey, 604800, JSON.stringify(user)); // 7 Days
            
            const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
