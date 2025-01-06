import { createContext, ReactNode, useContext, useState } from "react";
import { TimerMode } from "../types";
import {
  BREAK_MINUTES,
  LONG_BREAK_MINUTES,
  NUM_SESSIONS,
  SESSION_MINUTES,
} from "../constants";

// TODO: figure out what we can use storage-wise on DeskThing Client, or get this from Server to avoid losing state
export interface PomodoroContextType {
  totalSessions: number;
  currentSession: number;
  setCurrentSession: React.Dispatch<React.SetStateAction<number>>;
  currentMode: TimerMode;
  setCurrentMode: React.Dispatch<React.SetStateAction<TimerMode>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  timeLeftSec: number;
  setTimeLeftSec: React.Dispatch<React.SetStateAction<number>>;
  isComplete: boolean;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  handlePause: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleReset: () => void;
}

export const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const usePomodoroContext = () => useContext(PomodoroContext);

interface PomodoroProviderProps {
  totalSessions?: number;
  children: ReactNode;
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({
  totalSessions = NUM_SESSIONS,
  children,
}) => {
  const [currentSession, setCurrentSession] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<TimerMode>("session");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(SESSION_MINUTES * 60);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handlePrevious = () => {
    // Case 1: left click on first session. Reset first session
    if (currentMode === "session" && currentSession === 0) {
      setCurrentSession(0);
      setTimeLeftSec(SESSION_MINUTES * 60);
      setCurrentMode("session");
    }
    // Case 2: left click on any break. Reset to -1 session ago
    else if (["short-break", "long-break"].includes(currentMode)) {
      setIsComplete(false);
      setTimeLeftSec(SESSION_MINUTES * 60);
      setCurrentMode("session");
    }
    // Case 3: left click on any session besides first. Reset to previous short break
    else if (currentMode === "session" && currentSession !== 0) {
      setTimeLeftSec(BREAK_MINUTES * 60);
      setCurrentMode("short-break");
      setCurrentSession((prev) => prev - 1);
    } else {
      console.error("Unhandled left click state");
    }
  };

  const handleNext = () => {
    // Case 1: right click on last session. Go to long break
    if (currentMode === "session" && currentSession === totalSessions - 1) {
      setTimeLeftSec(LONG_BREAK_MINUTES * 60);
      setCurrentMode("long-break");
    }
    // Case 2: right click on any short break. Go to next session
    else if (currentMode === "short-break") {
      setTimeLeftSec(SESSION_MINUTES * 60);
      setCurrentMode("session");
      setCurrentSession((prev) => prev + 1);
    }
    // Case 4: when long break ends, overall session is complete
    else if (currentMode === "long-break") {
      setTimeLeftSec(0);
      setIsComplete(true);
    }
    // Case 3: right click on any session besides last. Go to next short break
    else if (
      currentMode === "session" &&
      currentSession !== totalSessions - 1
    ) {
      setTimeLeftSec(BREAK_MINUTES * 60);
      setCurrentMode("short-break");
    } else {
      console.error("Unhandled left click state");
    }
  };

  const handleReset = () => {
    setIsPaused(true);
    setTimeLeftSec(SESSION_MINUTES * 60);
    setIsComplete(false);
    setCurrentMode("session");
    setCurrentSession(0);
  };

  return (
    <PomodoroContext.Provider
      value={{
        totalSessions: NUM_SESSIONS,
        currentSession,
        setCurrentSession,
        currentMode,
        setCurrentMode,
        isPaused,
        setIsPaused,
        timeLeftSec,
        setTimeLeftSec,
        isComplete,
        setIsComplete,
        handlePause,
        handlePrevious,
        handleNext,
        handleReset,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};
