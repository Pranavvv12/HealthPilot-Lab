import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { importExcelData } from "./importExcelData.js";
import Loinc from "./models/loinc.js";
import authRoutes from "./routes/auth.js";
import { protect } from "./middleware/authMiddleware.js";
import { authLimiter, searchLimiter } from "./middleware/rateLimiter.js"; 
import { initRedis } from "./utils/redisClient.js";
import { getCached, setCached } from "./utils/cache.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",  
  methods: ["GET", "POST"],         
  credentials: true                
}));
const PORT = process.env.PORT || 5000;

// Define routes before starting the server
app.get("/", (req, res) => {
  res.send("Hello from backend!");
});
app.use("/auth", authLimiter,authRoutes);

// Protect /search with JWT middleware
app.get("/search", protect,searchLimiter, async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
     const cached = await getCached(cacheKey);
     if (cached) {
      console.log(`🔁 Cache hit for query "${query}"`);
      return res.json(cached);
    }
    const results = await Loinc.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .exec();
await setCached(cacheKey, results, 300);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Add this to your server.js file
app.get("/test-db", async (req, res) => {
  try {
    // Simple query to test database connection
    const count = await mongoose.connection.db.collection('users').countDocuments();
    res.json({ 
      message: "Database connection successful", 
      usersCount: count,
      dbName: mongoose.connection.db.databaseName
    });
  } catch (err) {
    console.error("Database test error:", err);
    res.status(500).json({ error: "Database connection error", details: err.message });
  }
});
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
await initRedis();
    // Import Excel data once on server start (comment out if you want to disable)
    // await importExcelData();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

startServer();