const { logEvents } = require("../middleware/logEvents");
const User = require("../models/User.model.js");
const Session = require("../models/Session.model.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  const authHeader = req.get("Authorization");
  let refreshToken = cookies?.refreshToken;

  if (!refreshToken && authHeader?.startsWith("Bearer ")) {
    refreshToken = authHeader.split(" ")[1];
  }

  if (!refreshToken) {
    logEvents(`refreshToken not found!`);
    return res.status(401).json({ message: "Refresh token not found" });
  }

  const foundSession = await Session.findOne({ refreshToken: refreshToken });
  if (!foundSession) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  // Kiểm tra hạn dùng
  if (foundSession.expiresAt < new Date()) {
    await Session.deleteOne({ _id: foundSession._id });
    return res.status(403).json({ message: "Refresh token expired" });
  }

  const user = await User.findById(foundSession.userId);
  if (!user) return res.sendStatus(403);

  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "300s" },
  );

  logEvents(`User ${user.username} refreshed token successfully!`);
  res.json({ accessToken });
};

module.exports = { handleRefreshToken };
