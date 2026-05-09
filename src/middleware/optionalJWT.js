const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

const optionalJWT = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization") || req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = undefined;
      return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        req.user = undefined;
        return next();
      }

      if (!decoded.userId) {
        req.user = undefined;
        return next();
      }

      const user = await User.findById(decoded.userId).select("-hashedPassword");
      req.user = user || undefined;
      next();
    });
  } catch (error) {
    req.user = undefined;
    next();
  }
};

module.exports = optionalJWT;
