<<<<<<< Updated upstream
import { logEvents } from "../middleware/logEvents.js";
import User from "../models/User.model.js";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    logEvents(`jwt token not found!`); // username not found
    return res.sendStatus(401); // Unauthorized
  }
  const refreshToken = cookies.jwt;

  // wait for the DB response
  const foundUser = await User.findOne({ refreshToken: refreshToken });
  if (!foundUser) {
    return res.sendStatus(403); // Forbidden
=======
import { logEvents } from '../middleware/logEvents.js'
import User from '../model/users.model.js'

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwt) {
    logEvents(`jwt token not found!`) // username not found
    return res.sendStatus(401) // Unauthorized
  }
  const refreshToken = cookies.jwt

  // wait for the DB response
  const foundUser = await User.findOne({ refreshToken: refreshToken })
  if (!foundUser) {
    return res.sendStatus(403) // Forbidden
>>>>>>> Stashed changes
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
<<<<<<< Updated upstream
      return res.sendStatus(403); //invalid token
    const accessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "300s" },
    );
    logEvents(`User ${decoded.username} refresh token successfully!`); // username not found
    res.json({ accessToken });
  });
};

export default { handleRefreshToken };
=======
      return res.sendStatus(403) //invalid token
    const accessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '300s' }
    )
    logEvents(`User ${decoded.username} refresh token successfully!`) // username not found
    res.json({ accessToken })
  })
}

export default { handleRefreshToken }
>>>>>>> Stashed changes
