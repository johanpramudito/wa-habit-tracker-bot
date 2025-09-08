const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const dotenv = require("dotenv");
const { log } = require("./utils/logger");
const { handleCommand } = require("./handlers/commandHandler");
const { startScheduler } = require("./scheduler/reminders");

dotenv.config();

const sessionName = process.env.WA_SESSION_NAME || "habit-bot-session";
log("info", "🚀 Starting Habit Tracker Bot...");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: sessionName }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  log("info", "📷 QR code generated. Please scan with WhatsApp.");
});

client.on("authenticated", () => {
  log("info", "🔐 Authentication successful!");
});

client.on("ready", () => {
  log("info", "✅ WhatsApp client is ready.");
  // Start the cron jobs once the client is ready
  startScheduler(client);
});

client.on("auth_failure", (msg) => {
  log(
    "error",
    `Authentication failure: ${msg}. Please try running "npm run reset-session" and restart.`
  );
});

client.on("disconnected", (reason) => {
  log("warn", `Client was logged out: ${reason}. Attempting to reconnect...`);
  client.initialize();
});

client.on("message", async (message) => {
  // Ignore messages from groups or status updates
  if (message.from.endsWith("@g.us") || message.isStatus) {
    return;
  }

  try {
    log("info", `Message from ${message.from}: "${message.body}"`);
    await handleCommand(client, message);
  } catch (err) {
    log("error", `Handler error: ${err?.stack || err}`);
    try {
      await message.reply("Maaf, terjadi kesalahan saat memproses pesanmu. 😥");
    } catch (replyError) {
      log("error", `Failed to send error reply: ${replyError.message}`);
    }
  }
});

client.initialize();

process.on("unhandledRejection", (reason, promise) => {
  log("error", "Unhandled Rejection at:", promise, "reason:", reason);
});
