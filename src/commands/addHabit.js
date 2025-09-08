const habitModel = require("../models/habitModel");

exports.execute = async (client, message, args) => {
  const habitName = args.join(" ").toLowerCase();
  if (!habitName) {
    await client.sendMessage(
      message.from,
      "Gagal! Mohon sebutkan nama kebiasaan.\nContoh: `tambah olahraga`"
    );
    return;
  }

  const existingHabit = await habitModel.findHabit(message.from, habitName);
  if (existingHabit) {
    await client.sendMessage(
      message.from,
      `Hmm, kebiasaan "${habitName}" sudah ada dalam daftarmu.`
    );
    return;
  }

  await habitModel.addHabit(message.from, habitName);
  await client.sendMessage(
    message.from,
    `✅ Kebiasaan baru "${habitName}" telah ditambahkan!`
  );
};
