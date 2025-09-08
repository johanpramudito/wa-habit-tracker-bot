const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const habitModel = require("../src/models/habitModel");

// Mock the getDbConnection to use an in-memory database for tests
jest.mock("../src/utils/db", () => ({
  getDbConnection: jest.fn(),
}));
const { getDbConnection } = require("../src/utils/db");

describe("Habit Model", () => {
  let db;

  beforeAll(async () => {
    db = await open({
      filename: ":memory:",
      driver: sqlite3.Database,
    });
    getDbConnection.mockResolvedValue(db);

    // Schema with the required created_at column
    await db.exec(`
            CREATE TABLE habits (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                habit_name TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(user_id, habit_name)
            )
        `);
    await db.exec(
      "CREATE TABLE habit_entries (id INTEGER PRIMARY KEY, habit_id INTEGER, entry_date TEXT)"
    );
  });

  beforeEach(async () => {
    // Clear tables before each test
    await db.exec("DELETE FROM habits");
    await db.exec("DELETE FROM habit_entries");
  });

  afterAll(async () => {
    await db.close();
  });

  test("should add a new habit for a user", async () => {
    const userId = "user1";
    const habitName = "meditasi";
    await habitModel.addHabit(userId, habitName);

    const habit = await db.get(
      "SELECT * FROM habits WHERE user_id = ? AND habit_name = ?",
      [userId, habitName]
    );
    expect(habit).toBeDefined();
    expect(habit.habit_name).toBe(habitName);
  });

  test("should find an existing habit", async () => {
    const now = new Date().toISOString();
    await db.run(
      "INSERT INTO habits (user_id, habit_name, created_at) VALUES (?, ?, ?)",
      ["user2", "olahraga", now]
    );

    const found = await habitModel.findHabit("user2", "olahraga");
    expect(found).toBeDefined();
    expect(found.habit_name).toBe("olahraga");
  });

  test("should mark a habit as done", async () => {
    const now = new Date().toISOString();
    const res = await db.run(
      "INSERT INTO habits (user_id, habit_name, created_at) VALUES (?, ?, ?)",
      ["user3", "baca", now]
    );
    const habitId = res.lastID;
    const { alreadyDone } = await habitModel.markHabitDone(habitId);

    expect(alreadyDone).toBe(false);
    const entry = await db.get(
      "SELECT * FROM habit_entries WHERE habit_id = ?",
      [habitId]
    );
    expect(entry).toBeDefined();
  });

  test("should not add a duplicate entry for the same day", async () => {
    const now = new Date().toISOString();
    const res = await db.run(
      "INSERT INTO habits (user_id, habit_name, created_at) VALUES (?, ?, ?)",
      ["user4", "nulis", now]
    );
    const habitId = res.lastID;
    await habitModel.markHabitDone(habitId);
    const { alreadyDone } = await habitModel.markHabitDone(habitId);

    expect(alreadyDone).toBe(true);
    const entries = await db.all(
      "SELECT * FROM habit_entries WHERE habit_id = ?",
      [habitId]
    );
    expect(entries.length).toBe(1);
  });

  test("should remove a habit correctly", async () => {
    const now = new Date().toISOString();
    await db.run(
      "INSERT INTO habits (user_id, habit_name, created_at) VALUES (?, ?, ?)",
      ["user5", "jogging", now]
    );
    const success = await habitModel.removeHabit("user5", "jogging");

    expect(success).toBe(true);
    const habit = await db.get("SELECT * FROM habits WHERE user_id = ?", [
      "user5",
    ]);
    expect(habit).toBeUndefined();
  });

  test("should undo the last entry for a habit", async () => {
    const now = new Date().toISOString();
    const res = await db.run(
      "INSERT INTO habits (user_id, habit_name, created_at) VALUES (?, ?, ?)",
      ["user6", "coding", now]
    );
    const habitId = res.lastID;
    await habitModel.markHabitDone(habitId);
    const success = await habitModel.undoLastEntry(habitId);

    expect(success).toBe(true);
    const entry = await db.get(
      "SELECT * FROM habit_entries WHERE habit_id = ?",
      [habitId]
    );
    expect(entry).toBeUndefined();
  });
});
