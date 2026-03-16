// controllers/adminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const cacheKey = `auth:creds:${email}`;

    try {
        // ⚡ Fast Auth: Check Redis first
        const cachedAdmin = await redis.get(cacheKey);
        if (cachedAdmin) {
            const admin = JSON.parse(cachedAdmin);
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                console.log(`🚀 [Fast Auth] Admin verified via Redis: ${email}`);
                const token = jwt.sign(
                    { id: admin.id, role: 'admin' }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '7d' }
                );
                return res.json({ token, admin: { id: admin.id, email: admin.email, username: admin.username } });
            }
        }

        // 🐢 Standard Auth: Fetch from MongoDB
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(401).json({ message: 'Access denied' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Access denied' });

        // ✅ Store in Redis for "Fast Login" next time
        const adminToCache = { id: admin._id, email: admin.email, username: admin.username, password: admin.password };
        await redis.setex(cacheKey, 604800, JSON.stringify(adminToCache)); // 7 Days

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, admin: { id: admin._id, email: admin.email, username: admin.username } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
