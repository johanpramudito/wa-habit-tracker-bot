const habitModel = require("../models/habitModel");

exports.execute = async (client, message) => {
  const habits = await habitModel.getAllHabitsForUser(message.from);
  if (habits.length === 0) {
    await client.sendMessage(
      message.from,
      "Kamu belum punya kebiasaan apapun. Tambah satu dengan `tambah [nama kebiasaan]`"
    );
    return;
  }

  const habitList = habits
    .map((h, i) => `${i + 1}. ${h.habit_name}`)
    .join("\n");
  await client.sendMessage(
    message.from,
    `Ini daftar kebiasaanmu saat ini:\n\n${habitList}`
  );
};
