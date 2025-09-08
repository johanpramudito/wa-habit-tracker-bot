// scripts/resetSession.js
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const sessionName = process.env.WA_SESSION_NAME || "habit-bot-session";
const authDir = path.join(
  __dirname,
  "..",
  ".wwebjs_auth",
  `session-${sessionName}`
);

if (fs.existsSync(authDir)) {
  fs.rmSync(authDir, { recursive: true, force: true });
  console.log(`✅ Session "${sessionName}" has been deleted.`);
} else {
  console.log(`ℹ️ Session "${sessionName}" not found. Nothing to delete.`);
}
