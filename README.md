# Habit Buddy - Chatbot Pelacak Kebiasaan untuk WhatsApp 🤖💪

Habit Buddy adalah chatbot WhatsApp berbasis aturan (_rule-based_) yang berfungsi sebagai teman akuntabilitas personal Anda. Proyek ini dibangun untuk mengatasi masalah inkonsistensi dalam membangun kebiasaan dengan memindahkan proses pelacakan ke platform yang kita gunakan setiap hari: WhatsApp.

Bot ini tidak hanya sekadar pencatat, tetapi juga dirancang untuk memberikan dukungan emosional dan motivasi kontekstual berkat _rule engine_ hibrida yang cerdas. Ia mampu membedakan perintah fungsional dan percakapan natural, bahkan merujuk pada kemajuan pengguna saat mengobrol.

- **Teknologi Utama:** Node.js, [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js "null"), dan SQLite.
- **Dibuat oleh:** Alexander Johan Pramudito dan Muhammad Fajrulfalaq Izzulfirdausyah Suryaprabandaru.

## 🚀 Fitur Unggulan

- **📲 Integrasi Penuh WhatsApp:** Terhubung langsung menggunakan nomor WhatsApp, dengan sistem sesi agar tidak perlu memindai QR berulang kali.
- **📝 Manajemen Kebiasaan Lengkap:** Tambah, selesaikan, hapus, lihat status, dan batalkan pencatatan kebiasaan dengan perintah sederhana.
- **🧠 Rule Engine Hibrida:**

  - **Perintah Struktural:** Mengenali perintah spesifik seperti `tambah`, `selesai`, dan `status` untuk berinteraksi dengan database.
  - **Logika Konversasional:** Mampu merespons sapaan, ucapan terima kasih, dan keluhan (`aku malas`, `sedih`, dll.).

- **💬 Motivasi Kontekstual:** Memberikan dorongan semangat dengan merujuk pada data kebiasaan spesifik milik pengguna saat mengobrol.
- **🔄 Refleksi Kata Ganti:** Menggunakan teknik refleksi (seperti ELIZA) untuk menciptakan percakapan yang lebih personal dan alami (contoh: "Saya butuh..." -> "Kenapa kamu butuh...").
- **⏰ Pengingat Harian:** Secara otomatis mengirimkan pengingat setiap pagi untuk membantu menjaga konsistensi (menggunakan `node-cron`).
- **💾 Penyimpanan Lokal:** Semua data kebiasaan disimpan secara lokal dalam file database SQLite.
- **🛠️ Skrip Utilitas:** Termasuk skrip untuk inisialisasi database (`init-db`) dan mereset sesi WhatsApp (`reset-session`).

## 📁 Struktur Proyek

```
habit-tracker-bot/
├── data/
│   └── habits.sqlite         # File database SQLite
├── logs/
│   └── bot.log               # File log aktivitas bot
├── scripts/
│   ├── initDb.js             # Skrip untuk membuat tabel database
│   └── resetSession.js       # Skrip untuk menghapus sesi login
├── src/
│   ├── commands/             # Logika untuk setiap perintah (tambah, status, dll.)
│   ├── handlers/             # Otak utama bot (rule engine)
│   ├── models/               # Logika interaksi dengan database
│   ├── scheduler/            # Logika untuk pengingat terjadwal
│   ├── utils/                # Fungsi pendukung (logger, conversational)
│   └── index.js              # Titik masuk utama aplikasi
├── tests/
│   ├── commandHandler.test.js
│   └── habitModel.test.js
├── .env.example              # Contoh file konfigurasi
├── .gitignore
├── package.json
└── README.md

```

## ⚙️ Instalasi & Menjalankan Bot

### 1. Prasyarat

- [Node.js](https://nodejs.org/ "null") (disarankan versi LTS 20.x atau lebih baru)
- Git

### 2. Clone Repository

```
git clone https://github.com/johanpramudito/wa-habit-tracker-bot.git
cd wa-habit-tracker-bot
```

### 3. Install Dependensi

```
npm install
```

### 4. Konfigurasi

Salin file `.env.example` menjadi `.env`.

```
cp .env.example .env
```

Anda bisa mengubah isinya jika perlu, tetapi konfigurasi _default_ sudah cukup.

### 5. Inisialisasi _Database_

Jalankan perintah ini **satu kali** untuk membuat file database dan tabel yang diperlukan.

```
npm run init-db
```

### 6. Jalankan Bot

```
npm start
```

Pada saat pertama kali dijalankan, sebuah **QR code** akan muncul di terminal. Pindai QR code tersebut menggunakan aplikasi WhatsApp di ponsel Anda (dari menu **Perangkat Tertaut** / **Linked Devices**).

Setelah berhasil, sesi Anda akan tersimpan. Untuk menjalankan selanjutnya, Anda tidak perlu memindai ulang.

## 🔄 Reset Sesi

Jika Anda mengalami masalah login, ingin berganti akun WhatsApp, atau sesi terasa korup, jalankan skrip reset.

```
npm run reset-session
```

Setelah itu, jalankan kembali `npm start` untuk memindai QR code yang baru.

## 🧪 Testing

Proyek ini dilengkapi dengan _unit tests_ untuk memastikan logika inti berjalan dengan baik.

```
npm test
```

## 📸 Contoh Interaksi

**Contoh Teks:**

> **User:** halo
> **Bot:** Hai! Jangan lupa, ada kebiasaan **olahraga pagi** yang menunggumu. Kamu pasti bisa! 💪

> **User:** selesai olahraga pagi
> **Bot:** Kerja bagus! "olahraga pagi" sudah ditandai selesai untuk hari ini. Terus semangat! 💪

> **User:** aku capek banget hari ini
> **Bot:** Aku mengerti perasaan itu. Tapi hei, ingat kebiasaanmu untuk **baca buku**? Menyelesaikannya, bahkan sebentar saja, pasti bikin kamu merasa lebih baik!

## 📌 Catatan Penting

- Disarankan untuk **tidak menggunakan nomor WhatsApp utama Anda** untuk _testing_ atau _deployment_. Gunakan nomor cadangan untuk keamanan.
- Bot ini berbasis aturan, bukan AI canggih. Responsnya terbatas pada pola yang telah didefinisikan.
- Jaga kerahasiaan folder `.wwebjs_auth` karena berisi data sesi login Anda.
