const readline = require('readline');
const { handleCommand } = require('./src/handlers/commandHandler');
const { getDbConnection } = require('./src/utils/db');

/**
 * File ini berfungsi sebagai "pembungkus" untuk menjalankan logika bot
 * langsung di terminal Anda, tanpa memerlukan koneksi WhatsApp.
 */

// 1. Tampilan awal saat CLI dijalankan
console.log("🚀 Starting Habit Buddy in CLI mode...");
console.log("   - Ketik pesan Anda dan tekan Enter.");
console.log("   - Ketik 'exit' untuk keluar.");
console.log("---");

// 2. Kita tentukan satu ID pengguna yang konsisten untuk sesi CLI ini
const cliUserId = 'cli-user@c.us';

// 3. Kita buat "mock" atau "tiruan" dari WhatsApp client
//    Tujuannya hanya untuk menampilkan balasan bot ke console.
const mockClient = {
    sendMessage: (userId, text) => {
        // Hapus format bold markdown (*) agar tampilan di terminal lebih bersih
        const formattedText = text.replace(/\*/g, ''); 
        
        console.log('\n🤖 BOT:');
        console.log(formattedText);
        console.log("---");
    }
};

// 4. Siapkan interface untuk membaca input dari terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '👤 ANDA > '
});

// 5. Pastikan koneksi database siap sebelum memulai chat
getDbConnection().then(() => {
    // Tampilkan prompt input pertama kali
    rl.prompt();

    // Event listener untuk setiap baris yang diketik pengguna
    rl.on('line', async (line) => {
        const input = line.trim();

        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        // Buat objek "message" tiruan yang strukturnya mirip dengan dari whatsapp-web.js
        const mockMessage = {
            from: cliUserId,
            body: input
        };

        // Panggil handler utama dengan client dan message tiruan
        await handleCommand(mockClient, mockMessage);

        // Tampilkan prompt lagi untuk input selanjutnya
        rl.prompt();
    });

    // Event listener saat CLI ditutup
    rl.on('close', () => {
        console.log('\n👋 Sampai jumpa! Sesi CLI berakhir.');
        process.exit(0);
    });
}).catch(error => {
    console.error("Gagal memulai mode CLI karena database tidak terhubung:", error);
    process.exit(1);
});