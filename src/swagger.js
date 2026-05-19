const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const swaggerSpec = yaml.load(
  fs.readFileSync(path.join(__dirname, "..", "api_doc.yaml"), "utf8")
);

module.exports = swaggerSpec;
