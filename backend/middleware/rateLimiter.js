// middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

// 100 requests per IP per 15 minutes
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500,              
  standardHeaders: "draft-7", // adds RateLimit-* headers
  legacyHeaders: false,       
  message: { message: "Too many requests, please try again later." }, // JSON body
};

export const authLimiter = rateLimit(baseConfig);
export const searchLimiter = rateLimit(baseConfig);