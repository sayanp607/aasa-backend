const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (role) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];  // ✅ Extract only the token part

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== role) return res.status(403).json({ error: 'Forbidden' });

            req.userId = decoded.id;
            next();
        } catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
};

module.exports = auth;
