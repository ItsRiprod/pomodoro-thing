export type TimerMode = "session" | "short-break" | "long-break";
export type BreakType = "short-break" | "long-break";
export type PomodoroSettings = {
  devMode: boolean;
  numSessions: number;
  sessionMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  audioEnabled: boolean;
  colorA: string;
  colorB: string;
};

export type TimerState = {
  timeLeftSec: number;
  isPaused: boolean;
  currentMode: TimerMode;
  currentSession: number;
  isComplete: boolean;
};
