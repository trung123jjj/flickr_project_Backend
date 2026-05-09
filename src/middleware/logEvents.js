const { format } = require("date-fns");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, fileName = "eventLog.txt") => {
  const dateTime = `[${format(new Date(), "dd/MM/yyyy-HH:mm:ss")}]`;
  const logItem = `${dateTime}: ${message}\n`;
  console.log(logItem.trim());

  try {
    const logDir = path.join(__dirname, "..", "..", "logs");
    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir);
    }
    await fsPromises.appendFile(path.join(logDir, fileName), logItem);
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t ${req.headers.origin}\t${req.url}`, "reqLog.txt");
  next();
};

module.exports = { logEvents, logger };
