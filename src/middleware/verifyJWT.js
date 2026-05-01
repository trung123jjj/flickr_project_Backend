const jwt = require("jsonwebtoken");
const { logEvents } = require("./logEvents");
const User = require("../models/User.model.js");

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.sendStatus(401).json({ message: "Authorization not found" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token not found" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res
          .sendStatus(403)
          .json({ message: "accessToken expired or invalid" });
      req.user = decoded.username;
      logEvents(`User ${req.user} accessed protected route`);

      const user = await User.findById(decoded.username).select(
        "-hashedPassword",
      );
      if (!user)
        return res.status(404).json({ message: "User does not exist" });

      req.user = user;

      next();
    });
  } catch (error) {
    logEvents(`verifyJWT error ${error.message}`, "errorLog.txt");
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyJWT;
