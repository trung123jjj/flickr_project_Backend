const { sanitize } = require("express-mongo-sanitize");

const sanitizeMiddleware = (options = {}) => {
  return (req, res, next) => {
    ["body", "params", "headers", "query"].forEach((key) => {
      if (req[key]) {
        sanitize(req[key], options);
      }
    });
    next();
  };
};

module.exports = sanitizeMiddleware;
