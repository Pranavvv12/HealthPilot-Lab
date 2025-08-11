import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const app = express();
app.use(express.json()); // Middleware

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
