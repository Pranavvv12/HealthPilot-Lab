import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // you can access user info later via req.user
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};