const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

const optionalJWT = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization") || req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err || !decoded?.userId) {
        return next();
      }

      User.findById(decoded.userId).select("-hashedPassword").then(user => {
        req.user = user || undefined;
        next();
      }).catch(() => {
        next();
      });
    });
  } catch (error) {
    next();
  }
};

module.exports = optionalJWT;
