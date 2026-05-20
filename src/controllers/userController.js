const User = require("../models/User.model.js");
const Comment = require("../models/Comment.model.js");
const Rating = require("../models/Rating.model.js");
const Session = require("../models/Session.model.js");
const { logEvents } = require("../middleware/logEvents");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-hashedPassword");
    logEvents(`User ${req.user._id} accessed their profile`);
    res.json(user);
  } catch (error) {
    logEvents(`Error fetching user profile: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) {
      logEvents(`User with username ${username} not found for deletion`, "errorLog.txt");
      return res.status(404).json({ message: `User with username ${username} not found` });
    }

    const userId = user._id;

    await Comment.deleteMany({ userId });
    await Rating.deleteMany({ userId });
    await Session.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    logEvents(`Admin deleted user ${username} (${userId}) and all associated data`);
    return res.json({
      message: `User ${username} and all associated data deleted successfully`,
    });
  } catch (error) {
    logEvents(`Error deleting user: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image file" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    
    user.avatar_url = avatarUrl;
    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-hashedPassword");
    
    res.json({
      message: "Avatar updated successfully",
      user: updatedUser
    });

    logEvents(`User ${req.user._id} updated avatar`);
  } catch (error) {
    logEvents(`Error updating avatar: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const changeUsername = async (req, res) => {
  try {
    const { currentPassword, newUsername } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const duplicate = await User.findOne({ username: newUsername });
    if (duplicate) return res.status(409).json({ message: 'Username already exists' });

    user.username = newUsername;
    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    res.json({ message: 'Username updated successfully', accessToken, username: newUsername });
    logEvents(`User ${user._id} changed username to ${newUsername}`);
  } catch (error) {
    logEvents(`Error changing username: ${error.message}`, 'errorLog.txt');
    res.status(500).json({ message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    user.hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
    logEvents(`User ${user._id} changed password`);
  } catch (error) {
    logEvents(`Error changing password: ${error.message}`, 'errorLog.txt');
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUserProfile, deleteUser, updateAvatar, changeUsername, changePassword };
