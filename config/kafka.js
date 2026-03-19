const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'aasa-app',
  brokers: ['localhost:9092'], // Default Kafka port
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'notification-group' });

const connectKafka = async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka Producer Connected');
    await consumer.connect();
    console.log('✅ Kafka Consumer Connected');
  } catch (err) {
    console.error('❌ Kafka Connection Error:', err.message);
  }
};

module.exports = { kafka, producer, consumer, connectKafka };
