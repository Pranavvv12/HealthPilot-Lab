// models/User.js - Simplified version to isolate issues
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true
  },
  password: { 
    type: String, 
    required: true 
  }
});

// Simplified password hashing
userSchema.pre("save", async function(next) {
  try {
    // Only hash the password if it's new or modified
    if (!this.isModified("password")) {
      return next();
    }
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    console.error("Password hashing error:", error);
    next(error);
  }
});

// Simplified password comparison
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// Create the model
const User = mongoose.model("User", userSchema);

export default User;