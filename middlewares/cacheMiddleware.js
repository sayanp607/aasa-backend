const redis = require('../config/redis');

/**
 * Middleware to cache API responses in Redis
 * @param {string} keyPrefix - Prefix for the cache key (e.g., 'cloths', 'gifts')
 * @param {number} duration - Cache TTL in seconds (default 3600 / 1 hour)
 */
const cacheMiddleware = (keyPrefix, duration = 3600) => {
  return async (req, res, next) => {
    // Generate a unique cache key based on the URL
    const key = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      // Check if data is already in cache
      const cachedData = await redis.get(key);

      if (cachedData) {
        console.log(`🚀 [Cache Hit] Serving ${key} from Redis`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`🐢 [Cache Miss] Fetching ${key} from MongoDB`);

      // Override res.json to capture data before it's sent to the client
      const originalJson = res.json;
      res.json = (data) => {
        // Save the response data to Redis
        redis.setex(key, duration, JSON.stringify(data));
        
        // Return to the original res.json behavior
        return originalJson.call(res, data);
      };

      next();
    } catch (err) {
      console.error('❌ Redis Cache Middleware Error:', err);
      next(); // Proceed to controller even if cache fails
    }
  };
};

module.exports = cacheMiddleware;
