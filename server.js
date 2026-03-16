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
const server = http.createServer(app);  // ✅ Correct: create http server

// ✅ CORS setup
const FRONTEND_ORIGIN = [
    'http://localhost:5173',
    'http://192.168.43.1:5173',
    'https://aasa-five.vercel.app',
];
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ Initialize Socket.io with correct CORS
const io = new Server(server, {
    cors: {
        origin: FRONTEND_ORIGIN,
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

// ✅ Store user sockets
const userSockets = new Map();
const driverSockets = new Map();

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('register_user', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('register_driver', (driverId) => {
        driverSockets.set(driverId, socket.id);
        console.log(`Driver ${driverId} registered with socket ${socket.id}`);
    });

    socket.on('driver_location', (data) => {
        const { userId, coords } = data;
        const userSocketId = userSockets.get(userId);
        if (userSocketId) {
            io.to(userSocketId).emit('driver_location_update', coords);
        }
    });

    socket.on('disconnect', () => {
        for (let [userId, sockId] of userSockets) {
            if (sockId === socket.id) userSockets.delete(userId);
        }
        for (let [driverId, sockId] of driverSockets) {
            if (sockId === socket.id) driverSockets.delete(driverId);
        }
        console.log('Socket disconnected:', socket.id);
    });

    app.set('io', io);
    app.set('userSockets', userSockets);
    app.set('driverSockets', driverSockets);
});

// ✅ Instance identification for DevOps/Load-Balancing
const INSTANCE_ID = process.env.INSTANCE_ID || 'Standalone';

// ✅ Request tracking middleware
app.use((req, res, next) => {
    console.log(`📡 [Instance ${INSTANCE_ID}] Handling: ${req.method} ${req.url}`);
    next();
});

// ✅ Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(`✅ [Instance ${INSTANCE_ID}] MongoDB connected`);
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 [Instance ${INSTANCE_ID}] Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`❌ [Instance ${INSTANCE_ID}] MongoDB connection failed:`, err);
    });
