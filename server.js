const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const { connectKafka } = require('./config/kafka'); // ✅ Import Kafka

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

// ✅ Initialize Socket.io with Redis Adapter for multi-instance support
const { createAdapter } = require("@socket.io/redis-adapter");
const redis = require('./config/redis');

const io = new Server(server, {
    cors: {
        origin: FRONTEND_ORIGIN,
        credentials: true
    }
});

// ✅ Attach Redis Adapter (using ioredis)
const pubClient = redis.duplicate();
const subClient = redis.duplicate();
io.adapter(createAdapter(pubClient, subClient));

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

io.on('connection', (socket) => {
    console.log(`📡 [Instance ${INSTANCE_ID}] Socket connected: ${socket.id}`);

    // ✅ Users/Drivers join their own unique rooms for cross-instance messaging
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
        // Use Room-based broadcast (works across all instances thanks to Redis)
        io.to(`user:${userId}`).emit('driver_location_update', coords);
    });

    socket.on('disconnect', () => {
        console.log(`📡 [Instance ${INSTANCE_ID}] Socket disconnected: ${socket.id}`);
    });
});

app.set('io', io);

// ✅ Instance identification for DevOps/Load-Balancing
const INSTANCE_ID = process.env.INSTANCE_ID || 'Standalone';

// ✅ Request tracking middleware
app.use((req, res, next) => {
    console.log(`📡 [Instance ${INSTANCE_ID}] Handling: ${req.method} ${req.url}`);
    next();
});

// ✅ Connect to DB and Kafka, then start server
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log(`✅ [Instance ${INSTANCE_ID}] MongoDB connected`);
        
        await connectKafka(); // ✅ Connect Kafka Producer
        
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 [Instance ${INSTANCE_ID}] Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`❌ [Instance ${INSTANCE_ID}] MongoDB connection failed:`, err);
    });
