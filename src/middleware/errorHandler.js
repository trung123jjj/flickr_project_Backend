import { logEvents } from "./logEvents.js";

const errorHandler = (error, req, res, next) => {
  logEvents(`${error.name}: ${error.message}`, "errorLog.txt");
  res.status(500).send(error.message);
};

export default errorHandler;
