const cron = require("node-cron");
const { getAllHabitsForUser } = require("../models/habitModel");
const { getDbConnection } = require("../utils/db");
const { log } = require("../utils/logger");

function startScheduler(client) {
  // Schedule a daily reminder every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    log("info", "Running daily reminder cron job...");
    try {
      const db = await getDbConnection();
      const users = await db.all("SELECT DISTINCT user_id FROM habits");

      for (const user of users) {
        const habits = await getAllHabitsForUser(user.user_id);
        if (habits.length > 0) {
          const habitList = habits.map((h) => h.habit_name).join(", ");
          const message = `🌞 Pagi! Jangan lupa untuk menyelesaikan kebiasaanmu hari ini:\n\n*${habitList}*\n\nAyo semangat!`;
          await client.sendMessage(user.user_id, message);
        }
      }
      log("info", "Daily reminders sent successfully.");
    } catch (error) {
      log("error", `Failed to send daily reminders: ${error.message}`);
    }
  });

  log("info", "🗓️ Daily reminder scheduler started (runs at 8:00 AM).");
}

module.exports = { startScheduler };
