const { reflect, choose } = require("../src/utils/conversational");

describe("Conversational Utilities", () => {
  describe("reflect function", () => {
    test("should swap simple pronouns (saya -> kamu)", () => {
      expect(reflect("saya")).toBe("kamu");
    });

    test("should swap pronouns in reverse (kamu -> saya)", () => {
      expect(reflect("kamu")).toBe("saya");
    });

    test("should reflect pronouns in a full sentence", () => {
      expect(reflect("aku butuh bantuan darimu")).toBe(
        "kamu butuh bantuan dariku"
      );
    });

    test("should preserve capitalization of the first letter", () => {
      expect(reflect("Punyaku hilang")).toBe("Punyamu hilang");
    });

    test("should not reflect words that are not in the map", () => {
      expect(reflect("ini adalah tes biasa")).toBe("ini adalah tes biasa");
    });
  });

  describe("choose function", () => {
    test("should return an element that is present in the source array", () => {
      const options = ["a", "b", "c"];
      const choice = choose(options);
      expect(options).toContain(choice);
    });

    test("should correctly handle an array with only one element", () => {
      expect(choose(["satu-satunya pilihan"])).toBe("satu-satunya pilihan");
    });

    test("should return undefined when given an empty array", () => {
      expect(choose([])).toBeUndefined();
    });
  });
});
