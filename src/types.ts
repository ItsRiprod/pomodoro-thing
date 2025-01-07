export type TimerMode = "session" | "short-break" | "long-break";
export type BreakType = "short-break" | "long-break";

export type PomodoroSettings = {
  numSessions: number;
  sessionMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  audioEnabled: boolean;
  colorA: string;
  colorB: string;
};
