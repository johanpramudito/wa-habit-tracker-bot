const habitModel = require("../models/habitModel");

exports.execute = async (client, message, args) => {
  const habitName = args.join(" ").toLowerCase();
  if (!habitName) {
    await client.sendMessage(
      message.from,
      "Gagal! Mohon sebutkan nama kebiasaan yang ingin dihapus.\nContoh: `hapus olahraga`"
    );
    return;
  }

  const success = await habitModel.removeHabit(message.from, habitName);
  if (success) {
    await client.sendMessage(
      message.from,
      `🗑️ Kebiasaan "${habitName}" telah dihapus.`
    );
  } else {
    await client.sendMessage(
      message.from,
      `Maaf, kebiasaan "${habitName}" tidak ditemukan.`
    );
  }
};
