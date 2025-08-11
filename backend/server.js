import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { importExcelData } from "./importExcelData.js";  // import your Excel import function
import Loinc from "./models/loinc.js";                   // import your Mongoose model

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Import Excel data once on server start (comment out if you want to disable)
    await importExcelData();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

startServer();

app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

// Search API
app.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
    const results = await Loinc.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .exec();

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
