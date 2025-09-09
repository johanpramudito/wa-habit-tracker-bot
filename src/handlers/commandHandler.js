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
    reply: () =>
      choose([
        "Kabar baik! Aku siap membantumu mencatat kemajuan. Bagaimana denganmu?",
        "Baik! Terima kasih sudah bertanya. Bagaimana kabarmu?",
        "Aku baik-baik saja! Siap menyemangatimu hari ini. Gimana kabarmu?",
      ]) 
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
    reply: (match) => {
      const reflected = reflect(match.input || match[0]);
      return choose([
        `Aku mengerti kalau kamu merasa ${reflected}. Ingat, istirahat itu penting juga. Setelah itu, kita bisa coba lagi ya!`,
        `Tidak apa-apa merasa saat ${reflected}. Istirahat sejenak, lalu kita mulai lagi pelan-pelan!`,
      ]);
    },
  },
  {
    pattern: /\b(aku|saya) (berhasil|sukses|bisa)\b/i,
    reply: () =>
      choose([
        "Wah, hebat! Aku bangga padamu!",
        "Kerja kerasmu membuahkan hasil! Terus pertahankan semangat ini!",
      ]),
  },
  {
    pattern: /\b(senang|bahagia|happy) banget\b/i,
    reply: (match) => {
      const reflected = reflect(match.input || match[0]);
      return choose([
        `Itu kabar baik! Rayakan momen pada saat ${reflected} ini, kamu pantas mendapatkannya.`,
        `Kerja kerasmu terbayar ya! Terus pertahankan perasaan saat ${reflected} ini!`,
      ]);
    },
  },
  {
    pattern: /\b(sedih|galau|kecewa)\b/i,
    reply: (match) => {
      const reflected = reflect(match.input || match[0]);
      return choose([
        `Aku turut prihatin mendengarnya. Ingat, saat ${reflected} dalam hidup ini, setiap hari adalah kesempatan baru untuk memulai lagi.`,
        `Mengakui perasaan ${reflected} adalah langkah pertama untuk jadi lebih baik. Kamu hebat.`,
        `Tidak apa-apa untuk merasa ${reflected}. Peluk jauh untukmu.`,
      ]);
    },
  },
  {
    pattern: /\b(gagal|kacau|berantakan)\b/i,
    reply: () => 
      choose([
        "Gagal itu bagian dari proses belajar. Yang penting kamu sudah mencoba!",
        "Setiap orang pernah mengalami kegagalan. Yang penting adalah bagaimana kita bangkit kembali.",
      ]),
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
    reply: () =>
      choose([
        "Bingung itu normal. Coba pikirkan satu hal kecil yang bisa kamu lakukan sekarang.",
        "Kadang kita memang butuh waktu untuk mencari tahu. Mungkin bisa mulai hobi sederhana dulu",
      ]),
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
