import express from "express";
import Loinc from "../models/loinc.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'query' is required" });
  }

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
    console.error("Search API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
