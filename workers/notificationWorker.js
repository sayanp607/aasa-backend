const dotenv = require('dotenv');
dotenv.config();

const { consumer } = require('../config/kafka');
const { sendNotification } = require('../utils/emailService');
const mongoose = require('mongoose');

const runNotificationWorker = async () => {
  try {
    // Connect to DB for any manual lookups if needed
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 [Notification Worker] MongoDB Connected');

    await consumer.subscribe({ topic: 'aasa-orders', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log(`📩 [Notification Worker] Received Event: ${event.type}`);

        try {
          // Process the notification dynamically based on type
          await sendNotification(event.type, event.data);
          console.log(`✅ [Notification Worker] Notification sent for ${event.type} ID: ${event.data._id}`);
        } catch (err) {
          console.error(`❌ [Notification Worker] Failed to send notification:`, err.message);
        }
      },
    });
  } catch (err) {
    console.error('❌ [Notification Worker] Critical Error:', err.message);
  }
};

runNotificationWorker();
