// Kafka disabled: safe mock to prevent connection crashes
const mockProducer = {
  connect: async () => {},
  send: async () => {},
  disconnect: async () => {},
};

const mockConsumer = {
  connect: async () => {},
  subscribe: async () => {},
  run: async () => {},
  disconnect: async () => {},
};

const connectKafka = async () => {
  console.log('ℹ️ Kafka is disabled');
};

module.exports = {
  kafka: null,
  producer: mockProducer,
  consumer: mockConsumer,
  connectKafka,
};
