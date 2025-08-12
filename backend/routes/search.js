
import express from "express";
import Loinc from "../models/loinc.js";
import natural from "natural";

const router = express.Router();

const synonyms = {
  // Thyroid related
  "thyroid": ["tsh", "free t3", "free t4", "thyroid panel", "thyroid stimulating hormone"],
  "thyroid test": ["tsh", "free t3", "free t4", "thyroid panel"],
  "gland test": ["thyroid", "adrenal", "pituitary", "endocrine"],
  
  // Blood sugar related
  "sugar": ["glucose", "blood sugar", "hba1c", "hemoglobin a1c", "glycated hemoglobin"],
  "sugar test": ["glucose", "blood sugar", "hba1c", "diabetes test"],
  "diabetes test": ["glucose", "blood sugar", "hba1c", "glucose tolerance"],
  
  // Liver related
  "liver": ["alt", "ast", "bilirubin", "liver panel", "liver function", "hepatic"],
  "liver test": ["alt", "ast", "bilirubin", "liver panel", "transaminase"],
  
  // Kidney related
  "kidney": ["creatinine", "bun", "urea", "egfr", "renal function"],
  "kidney test": ["creatinine", "bun", "urea", "egfr", "renal function"],
  "renal": ["creatinine", "bun", "urea", "egfr", "kidney function"],
  
  // Cholesterol related
  "cholesterol": ["ldl", "hdl", "total cholesterol", "lipid panel", "triglycerides"],
  "cholesterol test": ["ldl", "hdl", "total cholesterol", "lipid panel"],
  "fat test": ["cholesterol", "lipid", "triglycerides"],
  
  // Common tests
  "blood count": ["cbc", "complete blood count", "hemoglobin", "hematocrit", "platelets"],
  "iron test": ["ferritin", "iron", "tibc", "transferrin"],
  "vitamin test": ["vitamin d", "vitamin b12", "folate"],
  "heart test": ["troponin", "bnp", "ck-mb"],
  "inflammation test": ["crp", "esr", "sed rate"],
  "infection test": ["wbc", "white blood cell", "culture"]
};

// Common explanations for lab tests
const explanations = {
  "glucose": "Measures blood sugar levels, important for diabetes monitoring",
  "tsh": "Thyroid Stimulating Hormone - evaluates thyroid function",
  "free t4": "Measures the amount of free thyroxine hormone, important for thyroid function",
  "free t3": "Measures the amount of free triiodothyronine hormone, important for thyroid function",
  "cholesterol": "Measures blood fat levels, important for heart health",
  "ldl": "Low-Density Lipoprotein - often called 'bad cholesterol'",
  "hdl": "High-Density Lipoprotein - often called 'good cholesterol'",
  "creatinine": "Measures kidney function and filtration rate",
  "alt": "Alanine Transaminase - enzyme that indicates liver health",
  "ast": "Aspartate Transaminase - enzyme that indicates liver health",
  "hemoglobin": "Protein in red blood cells that carries oxygen",
  "hba1c": "Hemoglobin A1c - reflects average blood glucose over 2-3 months"
};

// Stemmer for word normalization
const stemmer = natural.PorterStemmer;

router.get("/", async (req, res) => {
  const query = req.query.query?.trim();

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'query' is required" });
  }

  try {
    // Step 1: Normalize and expand query with synonyms
    const tokenizer = new natural.WordTokenizer();
    const queryTokens = tokenizer.tokenize(query.toLowerCase());
    
    // Stem each token
    const stemmedTokens = queryTokens.map(token => stemmer.stem(token));
    
    // Collect expanded terms
    let expandedQueries = [query];
    
    // Check for synonyms of the full query
    if (synonyms[query.toLowerCase()]) {
      expandedQueries = expandedQueries.concat(synonyms[query.toLowerCase()]);
    }
    
    // Check for synonyms of individual words and their stems
    queryTokens.forEach(token => {
      if (synonyms[token]) {
        expandedQueries = expandedQueries.concat(synonyms[token]);
      }
    });
    
    stemmedTokens.forEach(stem => {
      // Find keys in synonyms that contain this stem
      Object.keys(synonyms).forEach(key => {
        if (key.includes(stem) || stemmer.stem(key).includes(stem)) {
          expandedQueries = expandedQueries.concat(synonyms[key]);
        }
      });
    });
    
    // Remove duplicates
    expandedQueries = [...new Set(expandedQueries)];
    
    console.log("Expanded search terms:", expandedQueries);

    // Step 2: Try $text search first (fast)
    let textResults = await Loinc.find(
      { 
        $text: { $search: expandedQueries.join(" ") },
        // Focus on common lab tests, exclude other types
        CLASS: { $nin: ["RADIOLOGY", "DOCUMENT", "NOTE", "SURVEY"] },
        STATUS: { $ne: "DEPRECATED" }
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean();

    // If we found good matches from text search, process and return them
    if (textResults.length > 0) {
      return res.json(enhanceResults(textResults, query));
    }

    // Step 3: Fuzzy search (if text search failed or partial)
    const looseRegex = new RegExp(expandedQueries.join("|"), "i");

    const candidates = await Loinc.find(
      {
        $or: [
          { COMPONENT: looseRegex },
          { LONG_COMMON_NAME: looseRegex },
          { RELATEDNAMES2: looseRegex }
        ],
        CLASS: { $nin: ["RADIOLOGY", "DOCUMENT", "NOTE", "SURVEY"] },
        STATUS: { $ne: "DEPRECATED" }
      }
    ).lean();

    // Step 4: Calculate relevance score using multiple factors
    const scored = candidates.map(c => {
      // Combine all text fields for matching
      const allText = `${c.COMPONENT || ''} ${c.LONG_COMMON_NAME || ''} ${c.RELATEDNAMES2 || ''}`.toLowerCase();
      
      // Calculate Levenshtein distance for each expanded query term
      const distances = expandedQueries.map(term => {
        // Find the minimum distance between the term and any word in the text
        const words = allText.split(/\s+/);
        return Math.min(...words.map(word => 
          natural.LevenshteinDistance(word, term.toLowerCase())
        ));
      });
      
      // Use the minimum distance found
      const minDistance = Math.min(...distances);
      
      // Calculate a relevance score (inverse of distance)
      const relevance = 1 / (minDistance + 1);
      
      // Boost common lab tests
      const isCommonTest = allText.includes('glucose') || 
                           allText.includes('thyroid') || 
                           allText.includes('cholesterol') ||
                           allText.includes('hemoglobin');
      
      const commonBoost = isCommonTest ? 1.5 : 1;
      
      return { 
        ...c, 
        relevance: relevance * commonBoost,
        distance: minDistance
      };
    });

    // Step 5: Sort by relevance and limit
    scored.sort((a, b) => b.relevance - a.relevance);
    const topResults = scored.slice(0, 10);

    res.json(enhanceResults(topResults, query));
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to enhance results with explanations and highlight relevant fields
function enhanceResults(results, originalQuery) {
  return results.map(result => {
    // Extract the component name in lowercase for matching
    const componentLower = result.COMPONENT ? result.COMPONENT.toLowerCase() : '';
    
    // Find an explanation if available
    let explanation = null;
    for (const [term, desc] of Object.entries(explanations)) {
      if (componentLower.includes(term) || 
          (result.LONG_COMMON_NAME && result.LONG_COMMON_NAME.toLowerCase().includes(term))) {
        explanation = desc;
        break;
      }
    }
    
    // Create a patient-friendly version
    return {
      id: result._id,
      code: result.LOINC_NUM,
      name: result.COMPONENT,
      fullName: result.LONG_COMMON_NAME,
      alternateNames: result.RELATEDNAMES2 || [],
      system: result.SYSTEM, // Body system/fluid
      explanation: explanation || "A laboratory test used by healthcare providers",
      matchedQuery: originalQuery,
      // Include original data for reference
      originalData: result
    };
  });
}

export default router;