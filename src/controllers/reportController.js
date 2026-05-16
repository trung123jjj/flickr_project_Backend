const Report = require("../models/Report.model.js");
const { logEvents } = require("../middleware/logEvents");

const createReport = async (req, res) => {
  try {
    const { username, message } = req.body;

    if (!username || !message) {
      return res.status(400).json({ message: "Username and message are required" });
    }

    const report = await Report.create({ username, message });

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

module.exports = { createReport, getAllReports };
