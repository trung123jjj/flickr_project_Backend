import { format } from "date-fns";

import fs from "fs";
import { promises } from "fs";
import path, { dirname } from "path";
import { error } from "console";

const __dirname = import.meta.dirname;

export const logEvents = async (message, fileName = "eventLog.txt") => {
  const dateTime = `[${format(new Date(), "dd/MM/yyyy-HH:mm:ss")}]`;
  const logItem = `${dateTime}: ${message}\n`;
  // console.log(logItem);
  // console.log(__dirname)

  try {
    if (!fs.existsSync(path.join(__dirname, "../..", "logs"))) {
      // Create logs folder if not exists
      await promises.mkdir(path.join(__dirname, "../..", "logs"));
    }
    await promises.appendFile(
      path.join(__dirname, "../..", "logs", `${fileName}`),
      logItem,
    );
  } catch {
    console.log(path.join(__dirname, "../..", "logs"));
    console.error(error);
  }
};

export const logger = (req, res, next) => {
  logEvents(`${req.method}\t ${req.headers.origin}\t${req.url}`, "reqLog.txt");
  next();
};
