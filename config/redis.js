// Redis disabled: safe mock to prevent connection crashes
const mockRedis = {
  get: async () => null,
  set: async () => 'OK',
  setex: async () => 'OK',
  del: async () => 1,
  keys: async () => [],
  duplicate: () => mockRedis,
  on: () => mockRedis,
  status: 'disabled',
};

module.exports = mockRedis;
