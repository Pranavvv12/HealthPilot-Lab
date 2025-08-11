// utils/redisClient.js
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => {
  console.error("⚠️ Redis Client Error:", err?.message || err);
});

export async function initRedis() {
  try {
    await redis.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("⚠️ Redis connection failed, using in-memory cache:", err?.message || err);
  }
}