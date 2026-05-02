const jwt = require("jsonwebtoken");
const { logEvents } = require("./logEvents");
const User = require("../models/User.model.js");

const verifyJWT = (req, res, next) => {
  try {
    // Sử dụng req.get() để lấy header không phân biệt hoa/thường
    const authHeader = req.get("Authorization") || req.headers.authorization || req.headers.Authorization;
    
    console.log("Authorization header:", authHeader); // Debug log
    
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Authorization not found or invalid format");
      return res.status(401).json({ message: "Authorization not found" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Token not found after Bearer");
      return res.status(401).json({ message: "Token not found" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.log("JWT verify error:", err.message);
        return res.status(403).json({ message: "accessToken expired or invalid" });
      }

      // decoded contains userId, username, role from JWT payload
      if (!decoded.userId) {
        console.log("Invalid token payload - no userId");
        return res.status(403).json({ message: "Invalid token payload" });
      }

      const user = await User.findById(decoded.userId).select("-hashedPassword");
      if (!user) {
        console.log("User not found:", decoded.userId);
        return res.status(404).json({ message: "User does not exist" });
      }

      req.user = user;
      logEvents(`User ${user.username} accessed protected route`);
      next();
    });
  } catch (error) {
    logEvents(`verifyJWT error ${error.message}`, "errorLog.txt");
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyJWT;
