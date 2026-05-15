import { test, expect, describe, beforeEach, afterEach, setSystemTime, mock } from "bun:test";

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  length: 0,
  clear: () => {},
  key: () => null
};
global.localStorage = dummyStorage as any;

// To bypass zustand persist error in console
const consoleWarnMock = mock(() => {});
console.warn = consoleWarnMock;

import { useAppStore } from "./store";

describe("store - updateStreak", () => {
  beforeEach(() => {
    // Reset store
    useAppStore.setState({
      userProgress: {
        completedLessons: [],
        currentLesson: null,
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: "2023-01-01",
        achievements: [],
        skillPoints: {},
        quizScores: {},
        timeSpent: 0,
      }
    });
  });

  afterEach(() => {
    setSystemTime(); // restore system time
  });

  test("should not update streak if already active today", () => {
    setSystemTime(new Date("2023-01-01T12:00:00Z"));

    useAppStore.setState((s) => ({
      userProgress: { ...s.userProgress, streak: 5, lastActiveDate: "2023-01-01" }
    }));

    useAppStore.getState().updateStreak();

    const state = useAppStore.getState();
    expect(state.userProgress.streak).toBe(5);
    expect(state.userProgress.lastActiveDate).toBe("2023-01-01");
  });

  test("should increment streak if last active yesterday", () => {
    setSystemTime(new Date("2023-01-02T12:00:00Z"));

    useAppStore.setState((s) => ({
      userProgress: { ...s.userProgress, streak: 5, lastActiveDate: "2023-01-01" }
    }));

    useAppStore.getState().updateStreak();

    const state = useAppStore.getState();
    expect(state.userProgress.streak).toBe(6);
    expect(state.userProgress.lastActiveDate).toBe("2023-01-02");
  });

  test("should reset streak to 1 if last active before yesterday", () => {
    setSystemTime(new Date("2023-01-03T12:00:00Z"));

    useAppStore.setState((s) => ({
      userProgress: { ...s.userProgress, streak: 5, lastActiveDate: "2023-01-01" }
    }));

    useAppStore.getState().updateStreak();

    const state = useAppStore.getState();
    expect(state.userProgress.streak).toBe(1);
    expect(state.userProgress.lastActiveDate).toBe("2023-01-03");
  });
});
