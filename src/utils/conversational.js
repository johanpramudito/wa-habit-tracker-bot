/**
 * Peta untuk merefleksikan kata ganti dari pengguna ke bot.
 * Contoh: "Saya butuh..." -> "Kenapa kamu butuh..."
 */
const REFLECTIONS = new Map([
  ["saya", "kamu"],
  ["aku", "kamu"],
  ["gue", "lu"],
  ["gua", "lu"],
  ["kamu", "saya"],
  ["anda", "saya"],
  ["lu", "gue"],
  ["lo", "gue"],
  ["punyaku", "punyamu"],
  ["punyamu", "punyaku"],
  ["diriku", "dirimu"],
  ["dirimu", "diriku"],
  ["dariku", "darimu"],
  ["darimu", "dariku"],
  ["denganku", "denganmu"],
  ["denganmu", "denganku"],
]);

/**
 * Fungsi untuk mengubah kata ganti dalam sebuah kalimat.
 * @param {string} text Kalimat input dari pengguna.
 * @returns {string} Kalimat dengan kata ganti yang sudah direfleksikan.
 */
function reflect(text) {
  return text
    .split(/\b/)
    .map((tok) => {
      const lower = tok.toLowerCase();
      if (REFLECTIONS.has(lower)) {
        const repl = REFLECTIONS.get(lower);
        // Menjaga huruf kapital jika ada
        if (tok[0] === tok[0]?.toUpperCase()) {
          return repl.charAt(0).toUpperCase() + repl.slice(1);
        }
        return repl;
      }
      return tok;
    })
    .join("");
}

/**
 * Fungsi untuk memilih satu elemen acak dari sebuah array.
 * @param {Array<string>} arr Array berisi pilihan balasan.
 * @returns {string} Satu balasan acak.
 */
function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Balasan yang akan digunakan jika bot tidak mengerti pesan pengguna.
 */
const FALLBACKS = [
  "Hmm, aku kurang mengerti. Coba ketik `bantuan` untuk lihat daftar perintah ya.",
  "Maaf, bisa ulangi? Aku masih belajar. Ketik `bantuan` untuk melihat apa yang bisa aku lakukan.",
  "Oke! Ada lagi yang bisa aku bantu? Cek kebiasaanmu dengan `status` yuk!",
  "Siap! Kalau bingung, panggil aku dengan `bantuan` aja.",
];

module.exports = {
  reflect,
  choose,
  FALLBACKS,
};
