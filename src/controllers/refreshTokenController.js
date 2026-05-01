const { logEvents } = require("../middleware/logEvents");
const User = require("../models/User.model.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    logEvents(`jwt token not found!`);
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken: refreshToken });
  if (!foundUser) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "300s" },
    );
    logEvents(`User ${decoded.username} refresh token successfully!`);
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
