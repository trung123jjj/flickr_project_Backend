const User = require("../models/User.model.js");
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

const createNewUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.hashedPassword;

    res.status(200).json(userWithoutPassword);
    logEvents(`New user created: _id: ${user._id}, username: ${user.username}`);
  } catch (error) {
    logEvents(`Error creating new user: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.hashedPassword) updateData.hashedPassword = req.body.hashedPassword;
    if (req.body.avatar_url) updateData.avatar_url = req.body.avatar_url;

    await user.updateOne(updateData);

    const updatedUser = await User.findOne({
      username: updateData.username || username,
    }).select("-hashedPassword");

    res.json(updatedUser);

    logEvents(`User ${user._id} has been updated`);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const username = req.params.username;
    const result = await User.deleteOne({ username: username });

    if (!result.deletedCount) {
      logEvents(
        `User with username ${username} not found for deletion`,
        "errorLog.txt",
      );
      return res
        .status(404)
        .json({ message: `User with username ${username} not found` });
    }

    logEvents(`User with username ${username} has been deleted`);
    return res.json({
      message: `User with username ${username} deleted successfully`,
    });
  } catch (error) {
    logEvents(`Error deleting user: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    logEvents(`All users have been retrieved`);
    res.json(users);
  } catch (error) {
    logEvents(`Error fetching all users: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({
      username: username,
    }).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

    logEvents(`return user with username: ${username}`);
  } catch (error) {
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

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
    
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

module.exports = { getUserProfile, createNewUser, updateUser, deleteUser, getAllUsers, getUser, updateAvatar, changeUsername, changePassword };
