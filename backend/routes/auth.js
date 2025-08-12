import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
// Signup
router.post("/signup", async (req, res) => {
  console.log("Signup request received:", req.body);
  
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ message: "Please provide username and password" });
    }

    // Check if user already exists - with try/catch
    try {
      console.log("Checking if user exists:", username);
      let userExists = await User.findOne({ username });
      
      if (userExists) {
        console.log("User already exists:", username);
        return res.status(400).json({ message: "User already exists" });
      }
    } catch (findError) {
      console.error("Error checking existing user:", findError);
      return res.status(500).json({ message: "Database error while checking username" });
    }

    // Create user instance
    console.log("Creating new user instance");
    let user;
    try {
      user = new User({ username, password });
    } catch (createError) {
      console.error("Error creating user instance:", createError);
      return res.status(500).json({ message: "Error creating user" });
    }
    
    try {
      console.log("Saving user to database");
      await user.save();
      console.log("User saved successfully");
      return res.status(201).json({ message: "User created successfully" });
    } catch (saveError) {
      console.error("Error saving user:", saveError);
      
      // Check for MongoDB duplicate key error
      if (saveError.code === 11000) {
        console.log("Duplicate key error");
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check for validation errors
      if (saveError.name === 'ValidationError') {
        const messages = Object.values(saveError.errors).map(val => val.message);
        console.log("Validation error:", messages);
        return res.status(400).json({ message: messages.join(', ') });
      }
      
      return res.status(500).json({ message: "Database error while saving user" });
    }
  } catch (outerError) {
    // Catch any other unexpected errors
    console.error("Unexpected signup error:", outerError);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide username and password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;