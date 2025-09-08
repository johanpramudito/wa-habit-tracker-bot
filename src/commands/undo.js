const habitModel = require("../models/habitModel");

exports.execute = async (client, message, args) => {
  const habitName = args.join(" ").toLowerCase();
  if (!habitName) {
    await client.sendMessage(
      message.from,
      "Gagal! Mohon sebutkan nama kebiasaan.\nContoh: `batal olahraga`"
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

  const success = await habitModel.undoLastEntry(habit.id);
  if (success) {
    await client.sendMessage(
      message.from,
      `↩️ Tanda selesai terakhir untuk "${habitName}" telah dibatalkan.`
    );
  } else {
    await client.sendMessage(
      message.from,
      `Tidak ada tanda selesai untuk "${habitName}" yang bisa dibatalkan.`
    );
  }
};
