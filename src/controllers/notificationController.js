const Notification = require("../models/Notification.model.js");
const { logEvents } = require("../middleware/logEvents");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    logEvents(`Error fetching notifications: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    logEvents(`Error marking notifications read: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Notification.updateOne(
      { _id: id, userId: req.user._id },
      { read: true }
    );
    if (!result.matchedCount) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    logEvents(`Error marking notification read: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Notification.deleteOne({ _id: id, userId: req.user._id });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    logEvents(`Error deleting notification: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    logEvents(`Error fetching unread count: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getNotifications, markAllRead, markAsRead, deleteNotification, getUnreadCount };
