const User = require("../models/User.model.js");
const { logEvents } = require("../middleware/logEvents");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    logEvents(`User ${req.user._id} accessed their profile`);
    res.json(user);
  } catch (error) {
    logEvents(`Error fetching user profile: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error });
  }
};

const createNewUser = async (req, res) => {
  try {
    const user = await User.create(req.body).select("-hashedpassword");
    res.status(200).json(user);
    logEvents(`New user created: _id: ${user._id}, username: ${user.username}`);
  } catch (error) {
    logEvents(`Error creating new user: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: `${req.body.username}` });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.updateOne({
      username: `${req.body.username ? req.body.username : user.username}`,
      hashedPassword: `${req.body.hashedPassword ? req.body.hashedPassword : user.hashedPassword}`,
    });

    const updatedUser = await User.findOne({
      username: `${req.body.username}`,
    }).select("-hashedPassword");

    res.json(updatedUser);

    logEvents(`User with id ${req.body.id} has been updated`);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.deleteOne({ username: `${req.body.username}` });

    if (!user.deletedCount) {
      logEvents(
        `User with id ${req.body.username} not found for deletion`,
        "errorLog.txt",
      );
      return res
        .status(404)
        .json({ message: `User with id ${req.body.username} not found` });
    }

    logEvents(`User with id ${req.body.username} has been deleted`);
    return res.json({
      message: `User with id ${req.body.username} deleted successfully`,
    });
  } catch (error) {
    logEvents(`Error deleting user: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    logEvents(`All users have been retrieved`);
    res.json(users);
  } catch (error) {
    logEvents(`Error fetching all users: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      username: `${req.body.username}`,
    }).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

    logEvents(`return user with username: ${req.body.username}`);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUserProfile, createNewUser, updateUser, deleteUser, getAllUsers, getUser };
