const fs = require("fs");
const path = require("path");
const { reflect, choose, FALLBACKS } = require("../utils/conversational");
const habitModel = require("../models/habitModel");

// --- Memuat Perintah Struktural ---
const commands = new Map();
const commandFiles = fs
  .readdirSync(path.join(__dirname, "..", "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const commandName = file.split(".")[0];
  const command = require(`../commands/${file}`);
  commands.set(commandName.toLowerCase(), command);
}

const aliases = new Map([
  ["tambah", "addHabit"],
  ["add", "addHabit"],
  ["selesai", "markDone"],
  ["done", "markDone"],
  ["status", "status"],
  ["hapus", "removeHabit"],
  ["delete", "removeHabit"],
  ["remove", "removeHabit"],
  ["list", "listHabits"],
  ["daftar", "listHabits"],
  ["batal", "undo"],
  ["undo", "undo"],
  ["bantuan", "help"],
  ["help", "help"],
]);

// --- Aturan Percakapan (Rule-Based) ---
const CONVERSATIONAL_RULES = [
  // 1. Sapaan dan Obrolan Ringan
  {
    pattern: /\b(test|hai|halo|selamat (pagi|siang|sore|malam))\b/i,
    reply: () =>
      choose([
        "Halo! Siap untuk produktif hari ini? 💪",
        "Hai! Semangat ya. Jangan lupa catat kebiasaanmu nanti.",
        "Pagi! Apa rencanamu hari ini?",
      ]),
  },
  {
    pattern: /\b(hai|halo|selamat (pagi|siang|sore|malam))\b/i,
    reply: async (match, message) => {
      const habits = await habitModel.getAllHabitsForUser(message.from);
      if (!habits || habits.length === 0) {
        return choose([
          "Halo! Siap untuk memulai kebiasaan pertamamu? Coba ketik `tambah [nama kebiasaan]`.",
          "Hai! Selamat datang. Yuk, mulai lacak kebiasaanmu!",
          "Halo! Siap untuk produktif hari ini? 💪",
          "Hai! Semangat ya. Jangan lupa catat kebiasaanmu nanti.",
          "Pagi! Apa rencanamu hari ini?",
        ]);
      }

      const randomHabit = choose(habits);
      return choose([
        `Halo! Hari yang baik untuk menyelesaikan **${randomHabit.habit_name}**. Semangat ya!`,
        `Hai! Jangan lupa, ada kebiasaan **${randomHabit.habit_name}** yang menunggumu. Kamu pasti bisa! 💪`,
      ]);
    },
  },
  {
    pattern: /\b(makasih|terima kasih|thanks|thx)\b/i,
    reply: () =>
      choose([
        "Sama-sama! Senang bisa membantu.",
        "Tentu! Aku di sini untukmu.",
        "Siap! Terus semangat ya!",
      ]),
  },
  {
    pattern: /apa kabar/i,
    reply: async (match, message) => {
      const habits = await habitModel.getAllHabitsForUser(message.from);
      let longestStreak = 0;
      let streakHabit = "";

      for (const habit of habits) {
        const status = await habitModel.getHabitStatus(habit.id);
        if (status.streak > longestStreak) {
          longestStreak = status.streak;
          streakHabit = habit.habit_name;
        }
      }

      if (longestStreak > 2) {
        return `Kabar baik! Aku makin semangat lihat streak **${streakHabit}** kamu yang sudah ${longestStreak} hari! Bagaimana kabarmu?`;
      }
      return "Kabar baik! Aku siap membantumu mencatat kemajuan. Bagaimana denganmu?";
    },
  },
  {
    pattern: /lagi apa/i,
    reply: () =>
      choose([
        "Lagi nungguin kamu update kebiasaan, dong!",
        "Lagi siap-siap buat menyemangatimu!",
        "Gak lagi ngapa-ngapain, kamu sendiri?",
      ]),
  },
  {
    pattern: /\bselamat (tidur|malam|bobo)\b/i,
    reply: () =>
      choose([
        "Selamat tidur! Semoga mimpimu indah dan besok bangun dengan semangat baru.",
        "Selamat beristirahat. Sampai jumpa besok!",
      ]),
  },

  // 2. Respons Terhadap Emosi Pengguna
  {
    pattern: /\b(stress|stres|malas|capek|lelah|gak mood|ga mood)\b/i,
    reply: async (match, message) => {
      const habits = await habitModel.getAllHabitsForUser(message.from);
      if (habits && habits.length > 0) {
        const randomHabit = choose(habits);
        return choose([
          `Aku mengerti perasaan itu. Tapi hei, ingat kebiasaanmu untuk **${randomHabit.habit_name}**? Menyelesaikannya, bahkan sebentar saja, pasti bikin kamu merasa lebih baik!`,
          `Tidak apa-apa merasa lelah. Coba istirahat sejenak. Setelah itu, mungkin kamu bisa coba selesaikan **${randomHabit.habit_name}**? Satu langkah kecil saja sudah cukup.`,
        ]);
      }
      return choose([
        "Tidak apa-apa merasa lelah. Istirahat sejenak, lalu kita mulai lagi pelan-pelan!",
        "Semua orang butuh istirahat. Jangan terlalu keras pada dirimu sendiri ya.",
      ]);
    },
  },
  {
    pattern: /\b(aku|saya) (berhasil|sukses|bisa)\b/i,
    reply: async (match, message) => {
      const habits = await habitModel.getAllHabitsForUser(message.from);
      if (habits && habits.length > 0) {
        const randomHabit = choose(habits);
        const status = await habitModel.getHabitStatus(randomHabit.id);
        if (status.streak > 1) {
          return `Tentu saja kamu bisa! Apalagi streak **${randomHabit.habit_name}** kamu sudah **${status.streak} hari**! Aku ikut bangga dengan kemajuanmu!`;
        }
      }
      return `Aku tahu kamu bisa! Selamat ya! Aku ikut bangga.`;
    },
  },
  {
    pattern: /\b(senang|bahagia|happy) banget\b/i,
    reply: () =>
      choose([
        "Wah, ikut senang mendengarnya! Apa yang membuatmu bahagia hari ini?",
        "Itu kabar baik! Rayakan momen ini, kamu pantas mendapatkannya.",
        "Kerja kerasmu terbayar ya! Terus pertahankan perasaan positif ini!",
      ]),
  },
  {
    pattern: /\b(sedih|galau|kecewa)\b/i,
    reply: () =>
      choose([
        "Aku turut prihatin mendengarnya. Ingat, setiap hari adalah kesempatan baru untuk memulai lagi.",
        "Mengakui perasaan sedih adalah langkah pertama untuk jadi lebih baik. Kamu hebat.",
        "Tidak apa-apa untuk merasa tidak baik-baik saja. Peluk jauh untukmu.",
      ]),
  },
  {
    pattern: /\b(gagal|kacau|berantakan)\b/i,
    reply: async (match, message) => {
      const habits = await habitModel.getAllHabitsForUser(message.from);
      if (habits && habits.length > 0) {
        const randomHabit = choose(habits);
        return choose([
          `Hei, tidak apa-apa. Satu hari yang buruk tidak merusak semua kemajuanmu. Besok kita coba lagi ya untuk **${randomHabit.habit_name}**?`,
          `Kegagalan adalah bagian dari proses. Yang penting, kamu tidak menyerah. Fokus lagi ke **${randomHabit.habit_name}** besok, oke?`,
        ]);
      }
      return "Kegagalan adalah bagian dari proses. Yang penting, kamu tidak menyerah. Besok kita coba lagi ya?";
    },
  },
  // 3. Aturan Refleksi (ELIZA Style)
  {
    pattern: /\bbutuh (.+)\b/i,
    reply: (match) => `Kenapa kamu merasa butuh ${reflect(match[1])}?`,
  },
  {
    pattern: /\b(merasa|rasanya) (.+)\b/i,
    reply: (match) =>
      choose([
        `Apa yang membuatmu merasa ${reflect(match[2])}?`,
        `Ceritakan lebih banyak tentang perasaan ${reflect(match[2])} itu.`,
      ]),
  },
  {
    pattern: /\b(berpikir|pikir) (.+)\b/i,
    reply: (match) =>
      `Menarik sekali kamu berpikir tentang ${reflect(
        match[2]
      )}. Ada alasan khusus?`,
  },
  {
    pattern: /\b(ingin|mau|pengen) (.+)\b/i,
    reply: (match) =>
      `Itu keinginan yang bagus. Apa yang akan kamu lakukan untuk mencapai ${reflect(
        match[2]
      )}?`,
  },

  // 4. Menangani Keraguan dan Penundaan
  {
    pattern: /\b(ragu|tidak yakin|gak yakin)\b/i,
    reply: () =>
      choose([
        "Ragu itu wajar kok. Coba ambil satu langkah paling kecil dulu, yang paling mudah. Kamu pasti bisa.",
        "Tidak apa-apa merasa ragu. Ingat saja tujuanmu dan tahu bahwa aku di sini mendukungmu.",
      ]),
  },
  {
    pattern: /\b(mulai|kerjain) besok aja deh\b/i,
    reply: () =>
      choose([
        "Bagaimana kalau kita coba 5 menit saja hari ini? Hanya 5 menit, tidak lebih. Kadang memulai adalah bagian tersulit.",
        "Besok adalah misteri. Hari ini adalah hadiah. Coba sedikit saja, yuk?",
      ]),
  },
  {
    pattern: /ini (sulit|susah) banget\b/i,
    reply: () =>
      choose([
        "Aku percaya kamu bisa melewatinya. Memecahnya menjadi bagian-bagian yang lebih kecil sering kali sangat membantu.",
        "Memang tidak mudah, tapi justru karena itu rasanya akan luar biasa saat kamu berhasil!",
      ]),
  },
  {
    pattern:
      /\b(aku|saya) (bingung|gak tau|ga tau) (mau|harus) (apa|ngapain)\b/i,
    reply: async (match, message) => {
      const habits = await habitModel.getAllHabitsForUser(message.from);
      if (habits && habits.length > 0) {
        const randomHabit = choose(habits);
        return `Kalau bingung, coba fokus ke satu hal saja. Bagaimana kalau kita mulai dengan **${randomHabit.habit_name}** hari ini?`;
      }
      return "Kalau bingung, coba mulai dengan hal yang paling mudah. Apa satu hal kecil yang bisa kamu lakukan sekarang?";
    },
  },

  // 5. Pertanyaan Tentang Bot
  {
    pattern: /\bsiapa kamu\b/i,
    reply: () =>
      choose([
        "Aku adalah teman virtualmu, siap membantumu membangun kebiasaan baik.",
        "Panggil saja aku Habit Buddy! Tugasku adalah menyemangatimu.",
      ]),
  },
  {
    pattern: /kamu bisa apa/i,
    reply: () =>
      "Aku bisa membantumu mencatat kebiasaan, mengingatkanmu, dan yang paling penting, menyemangatimu setiap saat! Coba ketik `bantuan` untuk lihat perintahnya.",
  },
];

async function handleCommand(client, message) {
  const text = (message.body || "").trim();
  if (!text) return;

  // --- Langkah 1: Cek Perintah Struktural (Prioritas Utama) ---
  const parts = text.split(/\s+/);
  const commandStr = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (aliases.has(commandStr)) {
    const commandNameFromAlias = aliases.get(commandStr);
    const command = commands.get(commandNameFromAlias.toLowerCase());
    if (command) {
      try {
        await command.execute(client, message, args);
        return; // Perintah ditemukan dan dijalankan, hentikan proses.
      } catch (error) {
        console.error(
          `Error executing command ${commandNameFromAlias}:`,
          error
        );
        return;
      }
    }
  }

  // --- Langkah 2: Jika bukan perintah, Cek Aturan Percakapan ---
  for (const rule of CONVERSATIONAL_RULES) {
    const match = text.match(rule.pattern);
    if (match) {
      const replyText = rule.reply(match);
      await client.sendMessage(message.from, replyText);
      return; // Aturan percakapan cocok, hentikan proses.
    }
  }

  // --- Langkah 3: Jika tidak ada yang cocok, gunakan Fallback ---
  await client.sendMessage(message.from, choose(FALLBACKS));
}

module.exports = { handleCommand };
