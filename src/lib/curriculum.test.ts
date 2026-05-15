import { expect, test, describe } from "bun:test";
import { getLevel, getModule, getLesson, getLessonLevel } from "./curriculum";

describe("Curriculum Helpers", () => {
  describe("getLesson", () => {
    test("should return a lesson for a valid ID from level 1", () => {
      const lesson = getLesson("l1-m1-les1");
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe("l1-m1-les1");
      expect(lesson?.title).toBe("The Privacy Imperative");
    });

    test("should return a lesson for a valid ID from level 2", () => {
      const lesson = getLesson("l2-m1-les1");
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe("l2-m1-les1");
      expect(lesson?.title).toBe("The Cave of Ali Baba");
    });

    test("should return undefined for a non-existent lesson ID", () => {
      const lesson = getLesson("non-existent");
      expect(lesson).toBeUndefined();
    });
  });

  describe("getLevel", () => {
    test("should return a level for a valid ID", () => {
      const level = getLevel(1);
      expect(level).toBeDefined();
      expect(level?.id).toBe(1);
      expect(level?.title).toBe("Foundations");
    });

    test("should return undefined for a non-existent level ID", () => {
      const level = getLevel(999);
      expect(level).toBeUndefined();
    });
  });

  describe("getModule", () => {
    test("should return a module for a valid ID", () => {
      const mod = getModule("l1-m1");
      expect(mod).toBeDefined();
      expect(mod?.id).toBe("l1-m1");
      expect(mod?.title).toBe("Why Cryptography Matters");
    });

    test("should return undefined for a non-existent module ID", () => {
      const mod = getModule("non-existent");
      expect(mod).toBeUndefined();
    });
  });

  describe("getLessonLevel", () => {
    test("should return the correct level for a valid lesson ID", () => {
      const level = getLessonLevel("l1-m1-les1");
      expect(level).toBeDefined();
      expect(level?.id).toBe(1);
    });

    test("should return undefined for a non-existent lesson ID", () => {
      const level = getLessonLevel("non-existent");
      expect(level).toBeUndefined();
    });
  });
});
