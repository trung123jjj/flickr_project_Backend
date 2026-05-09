const User = require("../models/User.model.js");
const { logEvents } = require("../middleware/logEvents");
const path = require("path");

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

module.exports = { getUserProfile, createNewUser, updateUser, deleteUser, getAllUsers, getUser, updateAvatar };
