const redis = require('../config/redis');

/**
 * Purges all Redis keys starting with a specific prefix
 * @param {string} prefix 
 */
const purgeCache = async (prefix) => {
    try {
        const keys = await redis.keys(`${prefix}:*`);
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`🧹 [Cache Helper] Purged ${keys.length} keys for prefix: ${prefix}`);
        }
    } catch (err) {
        console.error(`❌ [Cache Helper] Failed to purge cache for prefix ${prefix}:`, err);
    }
};

module.exports = {
    purgeClothCache: () => purgeCache('cloths'),
    purgeGiftCache: () => purgeCache('gifts')
};
