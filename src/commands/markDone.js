const habitModel = require("../models/habitModel");

exports.execute = async (client, message, args) => {
  const habitName = args.join(" ").toLowerCase();
  if (!habitName) {
    await client.sendMessage(
      message.from,
      "Gagal! Mohon sebutkan nama kebiasaan yang selesai.\nContoh: `selesai olahraga`"
    );
    return;
  }

  const habit = await habitModel.findHabit(message.from, habitName);
  if (!habit) {
    await client.sendMessage(
      message.from,
      `Maaf, kebiasaan "${habitName}" tidak ditemukan.`
    );
    return;
  }

  const result = await habitModel.markHabitDone(habit.id);
  if (result.alreadyDone) {
    await client.sendMessage(
      message.from,
      `Hebat! Kebiasaan "${habitName}" sudah kamu selesaikan hari ini.`
    );
  } else {
    await client.sendMessage(
      message.from,
      `Kerja bagus! "${habitName}" sudah ditandai selesai untuk hari ini. Terus semangat! 💪`
    );
  }
};
