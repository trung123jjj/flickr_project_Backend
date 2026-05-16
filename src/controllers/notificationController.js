const Notification = require("../models/Notification.model.js");
const { logEvents } = require("../middleware/logEvents");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    logEvents(`Error fetching notifications: ${error.message}`, "errorLog.txt");
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

module.exports = { getNotifications, deleteNotification };
