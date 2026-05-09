const { logEvents } = require("./logEvents");

const errorHandler = (error, req, res, next) => {
  logEvents(`${error.name}: ${error.message}`, "errorLog.txt");
  res.status(500).json({ message: error.message || "Internal Server Error" });
};

module.exports = errorHandler;
