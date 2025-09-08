const habitModel = require("../models/habitModel");

exports.execute = async (client, message, args) => {
  const habitName = args.join(" ").toLowerCase();

  if (habitName) {
    // Status for a single habit
    const habit = await habitModel.findHabit(message.from, habitName);
    if (!habit) {
      await client.sendMessage(
        message.from,
        `Maaf, kebiasaan "${habitName}" tidak ditemukan.`
      );
      return;
    }
    const status = await habitModel.getHabitStatus(habit.id);
    await client.sendMessage(
      message.from,
      `Status untuk "${habit.habit_name}":\n🔥 Streak: *${status.streak} hari*`
    );
  } else {
    // Status for all habits
    const habits = await habitModel.getAllHabitsForUser(message.from);
    if (habits.length === 0) {
      await client.sendMessage(
        message.from,
        "Kamu belum punya kebiasaan apapun. Tambah satu dengan `tambah [nama kebiasaan]`"
      );
      return;
    }

    let report = "Laporan Status Kebiasaanmu:\n\n";
    for (const habit of habits) {
      const status = await habitModel.getHabitStatus(habit.id);
      report += `🔥 *${habit.habit_name}*: Streak *${status.streak} hari*\n`;
    }
    await client.sendMessage(message.from, report);
  }
};
