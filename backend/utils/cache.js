// utils/cache.js
import { redis } from "./redisClient.js";

// Simple in-memory cache fallback with TTL
const memoryCache = new Map();

// Clean up expired keys every minute (won’t keep process alive)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of memoryCache) {
    if (v.expiresAt <= now) memoryCache.delete(k);
  }
}, 60 * 1000).unref();

export async function getCached(key) {
  try {
    if (redis?.isOpen) {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    } else {
      const item = memoryCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiresAt) {
        memoryCache.delete(key);
        return null;
      }
      return item.value;
    }
  } catch (e) {
    console.error("Cache get error:", e?.message || e);
    return null;
  }
}

export async function setCached(key, value, ttlSeconds = 300) {
  try {
    if (redis?.isOpen) {
      await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } else {
      memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
  } catch (e) {
    console.error("Cache set error:", e?.message || e);
  }
}