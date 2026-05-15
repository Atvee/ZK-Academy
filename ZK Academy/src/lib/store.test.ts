import { test, it, expect, describe, beforeEach, afterEach, setSystemTime, mock } from "bun:test";

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

describe('useAppStore - completeLesson', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      userProgress: {
        completedLessons: [],
        currentLesson: 'lesson-1',
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        achievements: [],
        skillPoints: {
          cryptography: 0,
          mathematics: 0,
          circuits: 0,
          protocols: 0,
          engineering: 0,
          applications: 0,
        },
        quizScores: {},
        timeSpent: 0,
      }
    });
  });

  it('should add a new lesson to completedLessons, update xp and level, and clear currentLesson', () => {
    const store = useAppStore.getState();
    store.completeLesson('lesson-1', 100);

    const newState = useAppStore.getState();
    expect(newState.userProgress.completedLessons).toEqual(['lesson-1']);
    expect(newState.userProgress.xp).toBe(100);
    expect(newState.userProgress.level).toBe(1);
    expect(newState.userProgress.currentLesson).toBeNull();
  });

  it('should not duplicate a lesson in completedLessons if it is already completed', () => {
    useAppStore.setState({
      userProgress: {
        ...useAppStore.getState().userProgress,
        completedLessons: ['lesson-1'],
        xp: 100,
      }
    });

    const store = useAppStore.getState();
    store.completeLesson('lesson-1', 50);

    const newState = useAppStore.getState();
    expect(newState.userProgress.completedLessons).toEqual(['lesson-1']); // No duplication
    expect(newState.userProgress.xp).toBe(150); // XP still added
  });

  it('should correctly calculate the new level when XP crosses the threshold (500 XP per level)', () => {
    const store = useAppStore.getState();
    // Cross 500 XP threshold (Level 2)
    store.completeLesson('lesson-2', 500);

    let newState = useAppStore.getState();
    expect(newState.userProgress.xp).toBe(500);
    expect(newState.userProgress.level).toBe(2);

    // Cross 1000 XP threshold (Level 3)
    newState.completeLesson('lesson-3', 500);
    newState = useAppStore.getState();
    expect(newState.userProgress.xp).toBe(1000);
    expect(newState.userProgress.level).toBe(3);
  });

  it('should maintain the level if the added XP does not cross the threshold', () => {
    const store = useAppStore.getState();
    store.completeLesson('lesson-4', 499);

    const newState = useAppStore.getState();
    expect(newState.userProgress.xp).toBe(499);
    expect(newState.userProgress.level).toBe(1); // 499 / 500 is 0, + 1 = 1
  });
});

