import { DeskThing } from "deskthing-client";
import {
  PomodoroContextType,
  usePomodoroContext,
} from "./contexts/PomodoroContext";

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
