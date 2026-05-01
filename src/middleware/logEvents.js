const { format } = require("date-fns");
const fs = require("fs");
const { promises: fsPromises } = require("fs");
const path = require("path");

const logEvents = async (message, fileName = "eventLog.txt") => {
  const dateTime = `[${format(new Date(), "dd/MM/yyyy-HH:mm:ss")}]`;
  const logItem = `${dateTime}: ${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "../..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "../..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "../..", "logs", `${fileName}`),
      logItem,
    );
  } catch (err) {
    console.log(path.join(__dirname, "../..", "logs"));
    console.error(err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t ${req.headers.origin}\t${req.url}`, "reqLog.txt");
  next();
};

module.exports = { logEvents, logger };
