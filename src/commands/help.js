// src/commands/help.js
exports.execute = async (client, message) => {
  const helpText = `Halo! Aku Habit Buddy, teman virtual yang akan membantumu membangun kebiasaan baik. ✨

Ini caramu bisa berinteraksi denganku:

---
*📚 Mengelola Daftar Kebiasaan*
---
*1. Tambah kebiasaan baru yang ingin kamu lacak.*
   \`tambah [nama kebiasaan]\`
   Contoh: \`tambah baca buku 15 menit\`

*2. Hapus kebiasaan yang sudah tidak relevan.*
   \`hapus [nama kebiasaan]\`
   Contoh: \`hapus nonton tv\`

*3. Lihat semua daftar kebiasaanmu saat ini.*
   \`list\` atau \`daftar\`


---
*☀️ Perintah Utama (Sehari-hari)*
---
*4. Tandai kebiasaan yang sudah selesai hari ini.*
   \`selesai [nama kebiasaan]\`
   Contoh: \`selesai olahraga\`

*5. Lihat kemajuan dan streak-mu.*
   \`status\`
   Contoh: \`status\` atau \`status olahraga\`

*6. Salah input? Batalkan tanda selesai terakhir.*
   \`batal [nama kebiasaan]\`
   Contoh: \`batal olahraga\`


---
*💬 Ngobrol Denganku, Yuk!*
---
Aku bukan sekadar pencatat, lho! Kamu bisa:
- **Menyapaku**: Coba bilang \`halo\` atau \`selamat pagi\`.
- **Curhat**: Kalau lagi \`malas\` atau \`sedih\`, aku siap mendengarkan dan menyemangati.
- **Mengobrol**: Aku akan berusaha merespons obrolanmu senatural mungkin, coba saja!

Kalau butuh bantuan ini lagi, tinggal ketik \`bantuan\`.

Mari kita bangun kebiasaan baik, satu per satu! Semangat! 💪
`;

  await client.sendMessage(message.from, helpText);
};
