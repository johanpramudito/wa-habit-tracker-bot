// --- Mocking command modules ---
jest.mock("../src/commands/addHabit", () => ({ execute: jest.fn() }));
jest.mock("../src/commands/markDone", () => ({ execute: jest.fn() }));
jest.mock("../src/commands/help", () => ({ execute: jest.fn() }));

// --- Mocking conversational utility ---
// Kita mock fungsi 'choose' agar hasilnya bisa diprediksi saat tes
jest.mock("../src/utils/conversational", () => ({
  ...jest.requireActual("../src/utils/conversational"), // Impor fungsi asli seperti 'reflect'
  choose: jest.fn(), // Ganti 'choose' dengan mock function
}));

const { handleCommand } = require("../src/handlers/commandHandler");
const addHabit = require("../src/commands/addHabit");
const markDone = require("../src/commands/markDone");
const help = require("../src/commands/help");
const { choose } = require("../src/utils/conversational"); // Impor 'choose' yang sudah di-mock

describe("Command Handler", () => {
  let mockClient;
  const mockUser = "1234567890@c.us";

  beforeEach(() => {
    // Reset semua mock sebelum setiap tes
    jest.clearAllMocks();
    mockClient = { sendMessage: jest.fn() };
  });

  // --- Grup Tes untuk Perintah Struktural ---
  describe("Habit Commands", () => {
    test('should parse "tambah" command and call addHabit.execute', async () => {
      const message = { from: mockUser, body: "tambah baca buku" };
      await handleCommand(mockClient, message);
      expect(addHabit.execute).toHaveBeenCalledWith(mockClient, message, [
        "baca",
        "buku",
      ]);
      expect(mockClient.sendMessage).not.toHaveBeenCalled(); // Pastikan tidak ada balasan lain
    });

    test('should parse "selesai" command with single argument', async () => {
      const message = { from: mockUser, body: "selesai gym" };
      await handleCommand(mockClient, message);
      expect(markDone.execute).toHaveBeenCalledWith(mockClient, message, [
        "gym",
      ]);
    });

    test('should parse "bantuan" command with no arguments', async () => {
      const message = { from: mockUser, body: "bantuan" };
      await handleCommand(mockClient, message);
      expect(help.execute).toHaveBeenCalledWith(mockClient, message, []);
    });
  });

  // --- Grup Tes untuk Aturan Percakapan (BARU) ---
  describe("Conversational Rules", () => {
    test("should respond to a greeting using a chosen response", async () => {
      choose.mockReturnValue("Halo! Balasan dari tes."); // Atur balasan 'choose'
      const message = { from: mockUser, body: "hai apa kabar" };
      await handleCommand(mockClient, message);

      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        mockUser,
        "Halo! Balasan dari tes."
      );
      expect(addHabit.execute).not.toHaveBeenCalled(); // Pastikan tidak memanggil perintah lain
    });

    test("should respond with motivation for specific keywords", async () => {
      choose.mockReturnValue("Jangan menyerah, kamu pasti bisa!");
      const message = { from: mockUser, body: "aku lelah sekali" };
      await handleCommand(mockClient, message);

      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        mockUser,
        "Jangan menyerah, kamu pasti bisa!"
      );
    });

    test('should use reflection for "aku butuh..." rule', async () => {
      const message = { from: mockUser, body: "aku butuh semangat baru" };
      await handleCommand(mockClient, message);

      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        mockUser,
        "Kenapa kamu merasa butuh semangat baru?"
      );
    });

    test("should use a fallback response for unrecognized messages", async () => {
      choose.mockReturnValue("Maaf, aku tidak mengerti balasan ini.");
      const message = { from: mockUser, body: "apakah besok akan hujan?" };
      await handleCommand(mockClient, message);

      expect(addHabit.execute).not.toHaveBeenCalled(); // Pastikan tidak ada perintah yang terpanggil
      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        mockUser,
        "Maaf, aku tidak mengerti balasan ini."
      );
    });
  });
});
