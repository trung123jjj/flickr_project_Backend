import jwt from "jsonwebtoken";
import { logEvents } from "./logEvents.js";
import User from "../model/users.model.js";

const verifyJWT = (req, res, next) => {
  try {
    // get accessToken from header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.sendStatus(401).json({ message: "Authorization not found" });
    // console.log(authHeader)
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token not found" });

    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res
          .sendStatus(403)
          .json({ message: "accessToken expired or invalid" }); //invalid token
      req.user = decoded.username;
      // console.log(decoded)
      logEvents(`User ${req.user} accessed protected route`); // log access to protected route

      // find user
      const user = await User.findById(decoded.username).select(
        "-hashedPassword",
      );
      if (!user)
        return res.status(404).json({ message: "User does not exist" });

      // respond user to request
      req.user = user;

      next();
    });
  } catch (error) {
    // failed to verifyJWT
    logEvents(`verifyJWT error ${error.message}`, "errorLog.txt");
    return res.status(500).json({ message: error.message });
  }
};

export default verifyJWT;
