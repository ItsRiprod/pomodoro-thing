import { DeskThing } from "deskthing-client";
import {
  PomodoroContextType,
  usePomodoroContext,
} from "./contexts/PomodoroContext";
import type { PomodoroSettings } from "./types";
import { IS_DEV } from "./constants";

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export function requirePomodoroContext(): PomodoroContextType {
  const p = usePomodoroContext();
  if (!p) {
    throw new Error("Missing Pomodoro Context");
  }
  return p;
}

export function playNotification() {
  DeskThing.send({ type: "notify" });
}

export function coerceSettings(
  data: any,
  handleError: (message: string) => void
): PomodoroSettings {
  if (!data.numSessions || !data.numSessions.value) {
    handleError("Missing numSessions Setting");
  }

  if (!data.sessionLength || !data.sessionLength.value) {
    handleError("Missing sessionLength Setting");
  }

  if (!data.shortBreakLength || !data.shortBreakLength.value) {
    handleError("Missing shortBreakLength Setting");
  }

  if (!data.longBreakLength || !data.longBreakLength.value) {
    handleError("Missing longBreakLength Setting");
  }

  if (!data.audioEnabled) {
    handleError("Missing audioEnabled Setting");
  }

  if (!data.colorA || !data.colorA.value) {
    handleError("Missing Color A Setting");
  }

  if (!data.colorB || !data.colorB.value) {
    handleError("Missing Color B Setting");
  }

  return {
    devMode: IS_DEV,
    numSessions: data.numSessions.value,
    sessionMinutes: data.sessionLength.value,
    shortBreakMinutes: data.shortBreakLength.value,
    longBreakMinutes: data.longBreakLength.value,
    audioEnabled: data.audioEnabled.value,
    colorA: data.colorA.value,
    colorB: data.colorB.value,
  };
}
