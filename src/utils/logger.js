const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "..", "logs", "bot.log");
const LOG_LEVEL = (process.env.LOG_LEVEL || "info").toLowerCase();

function log(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${msg}`;

  const levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

  if (levelMap[level] >= levelMap[LOG_LEVEL]) {
    console.log(line);
  }

  fs.appendFileSync(logFile, line + "\n");
}

module.exports = { log };
