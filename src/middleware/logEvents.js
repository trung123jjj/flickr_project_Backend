const { format } = require("date-fns");

const logEvents = async (message, fileName = "eventLog.txt") => {
  const dateTime = `[${format(new Date(), "dd/MM/yyyy-HH:mm:ss")}]`;
  const logItem = `${dateTime}: ${message}`;
  console.log(logItem);
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t ${req.headers.origin}\t${req.url}`, "reqLog.txt");
  next();
};

module.exports = { logEvents, logger };
