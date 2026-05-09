const { logEvents } = require("../middleware/logEvents");
const User = require("../models/User.model.js");
const Session = require("../models/Session.model.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    logEvents(`refreshToken not found in cookies!`);
    return res.status(401).json({ message: "Refresh token not found" });
  }
  const refreshToken = cookies.refreshToken;

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
    { expiresIn: "7d" },
  );

  logEvents(`User ${user.username} refreshed token successfully!`);
  res.json({ accessToken });
};

module.exports = { handleRefreshToken };
