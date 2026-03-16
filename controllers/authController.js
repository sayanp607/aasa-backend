// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const cacheKey = `auth:creds:${email}`;

    try {
        // ⚡ Fast Auth: Check Redis first
        const cachedUser = await redis.get(cacheKey);
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                console.log(`🚀 [Fast Auth] Verified via Redis: ${email}`);
                const token = jwt.sign(
                    { id: user.id, role: 'user' }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '7d' }
                );
                return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        }

        // 🐢 Standard Auth: Fetch from MongoDB
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // ✅ Store in Redis for "Fast Login" next time
        const userToCache = { id: user._id, name: user.name, email: user.email, password: user.password };
        await redis.setex(cacheKey, 604800, JSON.stringify(userToCache)); // 7 Days

        const token = jwt.sign(
            { id: user._id, role: 'user' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
