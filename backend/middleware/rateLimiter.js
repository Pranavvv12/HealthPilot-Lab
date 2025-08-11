// middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

// 100 requests per IP per 15 minutes
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500,               // v7 uses 'limit' (if you installed v6, use 'max')
  standardHeaders: "draft-7", // adds RateLimit-* headers
  legacyHeaders: false,       // disables X-RateLimit-* headers
  message: { message: "Too many requests, please try again later." }, // JSON body
};

export const authLimiter = rateLimit(baseConfig);
export const searchLimiter = rateLimit(baseConfig);