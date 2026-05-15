import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===== Types =====
export type ViewId = 'home' | 'roadmap' | 'lesson' | 'playground' | 'circuit-builder' | 'visualizer' | 'sandbox' | 'tutor' | 'profile';

export interface Lesson {
  id: string;
  level: number;
  title: string;
  description: string;
  type: 'theory' | 'interactive' | 'coding' | 'challenge' | 'project';
  xpReward: number;
  prerequisites: string[];
  content: LessonContent[];
}

export interface LessonContent {
  type: 'text' | 'code' | 'visualization' | 'quiz' | 'challenge' | 'interactive';
  data: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  unlockedAt?: number;
  category: 'learning' | 'building' | 'streak' | 'mastery' | 'special';
}

export interface UserProgress {
  completedLessons: string[];
  currentLesson: string | null;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  achievements: string[];
  skillPoints: Record<string, number>;
  quizScores: Record<string, number>;
  timeSpent: number;
}

export interface AppState {
  // Navigation
  currentView: ViewId;
  currentLessonId: string | null;
  currentLevel: number;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;

  // User
  userProgress: UserProgress;
  userName: string | null;

  // AI Tutor
  tutorOpen: boolean;
  tutorMessages: TutorMessage[];

  // Visualizers
  activeVisualization: string | null;
  visualizationParams: Record<string, unknown>;

  // Circuit Builder
  circuitNodes: CircuitNode[];
  circuitConnections: CircuitConnection[];

  // Playground
  playgroundCode: string;
  playgroundLanguage: 'circom' | 'noir' | 'solidity' | 'typescript';
  playgroundOutput: string;

  // Actions
  setView: (view: ViewId) => void;
  setCurrentLesson: (lessonId: string | null) => void;
  setCurrentLevel: (level: number) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  completeLesson: (lessonId: string, xp: number) => void;
  addXp: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  setTutorOpen: (open: boolean) => void;
  addTutorMessage: (message: TutorMessage) => void;
  clearTutorMessages: () => void;
  setActiveVisualization: (id: string | null) => void;
  setVisualizationParams: (params: Record<string, unknown>) => void;
  setCircuitNodes: (nodes: CircuitNode[]) => void;
  setCircuitConnections: (connections: CircuitConnection[]) => void;
  setPlaygroundCode: (code: string) => void;
  setPlaygroundLanguage: (lang: 'circom' | 'noir' | 'solidity' | 'typescript') => void;
  setPlaygroundOutput: (output: string) => void;
  setUserName: (name: string) => void;
  updateSkillPoints: (skill: string, points: number) => void;
  saveQuizScore: (quizId: string, score: number) => void;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CircuitNode {
  id: string;
  type: 'add' | 'mul' | 'const' | 'input' | 'output';
  x: number;
  y: number;
  value?: number;
  label: string;
}

export interface CircuitConnection {
  id: string;
  from: string;
  to: string;
  fromPort: number;
  toPort: number;
}

const defaultProgress: UserProgress = {
  completedLessons: [],
  currentLesson: null,
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
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      currentLessonId: null,
      currentLevel: 1,
      sidebarOpen: false,
      commandPaletteOpen: false,

      // User
      userProgress: defaultProgress,
      userName: null,

      // AI Tutor
      tutorOpen: false,
      tutorMessages: [],

      // Visualizers
      activeVisualization: null,
      visualizationParams: {},

      // Circuit Builder
      circuitNodes: [],
      circuitConnections: [],

      // Playground
      playgroundCode: '',
      playgroundLanguage: 'circom',
      playgroundOutput: '',

      // Actions
      setView: (view) => set({ currentView: view }),
      setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId, currentView: lessonId ? 'lesson' : get().currentView }),
      setCurrentLevel: (level) => set({ currentLevel: level }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      completeLesson: (lessonId, xp) => set((s) => {
        const completedLessons = s.userProgress.completedLessons.includes(lessonId)
          ? s.userProgress.completedLessons
          : [...s.userProgress.completedLessons, lessonId];
        const newXp = s.userProgress.xp + xp;
        const newLevel = Math.floor(newXp / 500) + 1;
        return {
          userProgress: {
            ...s.userProgress,
            completedLessons,
            xp: newXp,
            level: newLevel,
            currentLesson: null,
          },
        };
      }),

      addXp: (amount) => set((s) => {
        const newXp = s.userProgress.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        return {
          userProgress: { ...s.userProgress, xp: newXp, level: newLevel },
        };
      }),

      unlockAchievement: (achievementId) => set((s) => {
        if (s.userProgress.achievements.includes(achievementId)) return s;
        return {
          userProgress: {
            ...s.userProgress,
            achievements: [...s.userProgress.achievements, achievementId],
          },
        };
      }),

      updateStreak: () => set((s) => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = s.userProgress.lastActiveDate;
        if (today === lastActive) return s;

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastActive === yesterday ? s.userProgress.streak + 1 : 1;

        return {
          userProgress: {
            ...s.userProgress,
            streak: newStreak,
            lastActiveDate: today,
          },
        };
      }),

      setTutorOpen: (open) => set({ tutorOpen: open }),
      addTutorMessage: (message) => set((s) => ({
        tutorMessages: [...s.tutorMessages, message],
      })),
      clearTutorMessages: () => set({ tutorMessages: [] }),

      setActiveVisualization: (id) => set({ activeVisualization: id }),
      setVisualizationParams: (params) => set({ visualizationParams: params }),

      setCircuitNodes: (nodes) => set({ circuitNodes: nodes }),
      setCircuitConnections: (connections) => set({ circuitConnections: connections }),

      setPlaygroundCode: (code) => set({ playgroundCode: code }),
      setPlaygroundLanguage: (lang) => set({ playgroundLanguage: lang }),
      setPlaygroundOutput: (output) => set({ playgroundOutput: output }),

      setUserName: (name) => set({ userName: name }),
      updateSkillPoints: (skill, points) => set((s) => ({
        userProgress: {
          ...s.userProgress,
          skillPoints: {
            ...s.userProgress.skillPoints,
            [skill]: (s.userProgress.skillPoints[skill] || 0) + points,
          },
        },
      })),
      saveQuizScore: (quizId, score) => set((s) => ({
        userProgress: {
          ...s.userProgress,
          quizScores: {
            ...s.userProgress.quizScores,
            [quizId]: Math.max(s.userProgress.quizScores[quizId] || 0, score),
          },
        },
      })),
    }),
    {
      name: 'zk-platform-store',
      partialize: (state) => ({
        userProgress: state.userProgress,
        userName: state.userName,
        currentLevel: state.currentLevel,
      }),
    }
  )
);
