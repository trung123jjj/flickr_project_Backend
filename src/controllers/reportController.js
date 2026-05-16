const Report = require("../models/Report.model.js");
const User = require("../models/User.model.js");
const Notification = require("../models/Notification.model.js");
const { logEvents } = require("../middleware/logEvents");

const createReport = async (req, res) => {
  try {
    const { username, message, commentContent } = req.body;

    if (!username || !message) {
      return res.status(400).json({ message: "Username and message are required" });
    }

    const report = await Report.create({ username, message, commentContent });

    res.status(201).json({ success: true, data: report });
    logEvents(`User ${req.user._id} reported user ${username}: ${message}`);
  } catch (error) {
    logEvents(`Error creating report: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
    logEvents(`Admin fetched all reports`);
  } catch (error) {
    logEvents(`Error fetching reports: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Report.deleteOne({ _id: id });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json({ success: true, message: "Report deleted successfully" });
    logEvents(`Admin deleted report ${id}`);
  } catch (error) {
    logEvents(`Error deleting report: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendNotice = async (req, res) => {
  try {
    const { username, commentContent } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Notification.create({
      userId: user._id,
      type: 'notice',
      message: `you have violated the platform rules in: ${commentContent || 'your comment'}`,
      commentContent: commentContent || '',
    });

    res.json({ success: true, message: "Notice sent to user" });
    logEvents(`Admin sent notice to user ${username}`);
  } catch (error) {
    logEvents(`Error sending notice: ${error.message}`, "errorLog.txt");
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createReport, getAllReports, deleteReport, sendNotice };
