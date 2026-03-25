import { logEvents } from "../middleware/logEvents";
import User from "..models/User.model.js";
import Session from "../models/Session.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

const ACCESS_TOKEN_TTL = "1800s"; // 900s for production and 1800s for testing
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const SignUp = async (req, res) => {
  try {
    // deconstruct request
    const { username, password, email } = req.body;
    console.log(username, password, email);

    // handle missing value on registration
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // check for duplicate usernames in the db
    const duplicateUser = await User.findOne({ username: username });
    if (duplicateUser) {
      logEvents(
        "Failed to register user, username already exists: " + username,
      );

      return res.status(409).json({ message: "Username already exists" });
    }

    const duplicateEmail = await User.findOne({ email: email });

    if (duplicateEmail) {
      logEvents("Failed to register user, email already exists: " + email);

      return res.status(410).json({ message: "Email already exists" });
    }
    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // store new user
    await User.create({
      username: username,
      hashedPassword: hashedPassword,
      email: email,
      // displayName: `${firstName} ${lastName}`
    });

    // successfully create new user
    logEvents(`New user registered: ${username}`);

    res.status(201).json({ message: `New user ${username} created` });
  } catch (error) {
    // failed to signUp
    logEvents(`signUp error ${error.message}`, "errorLog.txt");

    return res.status(500).json({ message: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    // deconstruct
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const foundUser = await User.findOne({ username: username });
    if (!foundUser) {
      // username not found
      logEvents(`Login failed: Username or password incorrect`);

      // return 'Username or password incorrect' so that others can not know which is incorrect
      return res
        .status(401)
        .json({ message: `Username or password incorrect` });
    }

    // check password
    const match = await bcrypt.compare(password, foundUser.hashedPassword);

    if (!match) {
      // incorrect password
      logEvents(`User ${username} failed to log in!`);

      // return 'Username or password incorrect' so that others can not know which is incorrect
      res.status(401).json({ message: "Username or password incorrect" });
    }

    // create accessToken with JWTs
    const accessToken = jwt.sign(
      {
        // payload
        userId: foundUser._id,
        username: foundUser.username,
        role: foundUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // create refreshToken
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // create session to store refresh token
    await Session.create({
      userId: foundUser._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // successful login
    logEvents(`User ${username} logged in successfully!`);

    // send refreshToken in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "none", // backend, frontend on different domain
      maxAge: REFRESH_TOKEN_TTL,
    });

    // send refreshToken in respond
    return res.status(200).json({
      message: `User ${foundUser.displayName} logged in!`,
      accessToken,
    });
  } catch (error) {
    // failed to signIn
    logEvents(`signIn error ${error.message}`, "errorLog.txt");
    return res.status(500).json({ message: error.message });
  }
};

export const signOut = async (req, res) => {
  try {
    // get refreshToken from cookie
    const token = req.cookies?.refreshToken;
    console.log(token);

    // res.status(200)
    if (token) {
      // delete refreshToken from Session
      await Session.deleteOne({ refreshToken: token });

      // delete cookie
      logEvents(`User Logged out`);
      res.clearCookie("refreshToken");
    }
    return res.status(204);
  } catch (error) {
    // failed to signOut
    logEvents(`signOut error ${error.message}`, "errorLog.txt");
    return res.status(500).json({ message: error.message });
  }
};
