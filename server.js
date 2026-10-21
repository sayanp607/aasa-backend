const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminClothRoutes = require('./routes/adminClothRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const cartRoutes = require('./routes/cart');
const giftRoutes = require('./routes/giftRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const rideRoutes = require('./routes/rideRoutes');
const deliveryorderRoutes = require("./routes/deliveryRoutes");
const deliveryuserRoutes = require("./routes/deliveryuserRoutes");
const contactRoutes = require('./routes/contactRoute');
const tripRoutes = require('./routes/tripRoutes');
const admintripRoutes = require('./routes/admintrip');
const bookingRoutes = require('./routes/booking');
const tripcartRoutes = require('./routes/tripcart');
const cartitemRoutes = require('./routes/cartitem');
const triporderRoutes = require('./routes/triporder');
const rappellingRoutes = require('./routes/rappelling');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS setup
const FRONTEND_ORIGIN = [
    'http://localhost:5173',
    'http://192.168.43.1:5173',
    'https://aasa-five.vercel.app',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            FRONTEND_ORIGIN.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.includes('localhost')
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit preflight handler (Express 5 compatible)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.origin;
        if (origin) {
            res.header('Access-Control-Allow-Origin', origin);
        } else {
            res.header('Access-Control-Allow-Origin', '*');
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check / root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Aasa Backend API is running' });
});

// ✅ Initialize Socket.io (In-memory mode, no Redis required)
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        credentials: true
    }
});

// ✅ API routes
app.use('/api/user', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/cloth', adminClothRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use("/api/orders", deliveryorderRoutes);
app.use("/api/delivery-users", deliveryuserRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admintrip', admintripRoutes);
app.use('/api/tripcart', cartitemRoutes);
app.use('/api/rappelling', rappellingRoutes);
app.use('/api/triporder', triporderRoutes);

// ✅ Instance identification
const INSTANCE_ID = process.env.INSTANCE_ID || 'Standalone';

io.on('connection', (socket) => {
    console.log(`📡 [Instance ${INSTANCE_ID}] Socket connected: ${socket.id}`);

    // Users/Drivers join their own unique rooms
    socket.on('register_user', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} joined room: user:${userId}`);
    });

    socket.on('register_driver', (driverId) => {
        socket.join(`driver:${driverId}`);
        console.log(`🚕 Driver ${driverId} joined room: driver:${driverId}`);
    });

    socket.on('driver_location', (data) => {
        const { userId, coords } = data;
        io.to(`user:${userId}`).emit('driver_location_update', coords);
    });

    socket.on('disconnect', () => {
        console.log(`📡 [Instance ${INSTANCE_ID}] Socket disconnected: ${socket.id}`);
    });
});

app.set('io', io);

// ✅ Request tracking middleware
app.use((req, res, next) => {
    console.log(`📡 [Instance ${INSTANCE_ID}] Handling: ${req.method} ${req.url}`);
    next();
});

// ✅ Start HTTP server immediately so Render health check passes instantly
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [Instance ${INSTANCE_ID}] Server running on port ${PORT}`);
});

// ✅ Connect to DB asynchronously
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(`✅ [Instance ${INSTANCE_ID}] MongoDB connected`);
    })
    .catch((err) => {
        console.error(`❌ [Instance ${INSTANCE_ID}] MongoDB connection failed:`, err);
    });
