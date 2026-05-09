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

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const user = await User.findById(foundSession.userId);
    if (!user) return res.sendStatus(403);

    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1800s" },
    );
    logEvents(`User ${user.username} refreshed token successfully!`);
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
