import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BreakType, PomodoroSettings, TimerMode } from "../types";
import {
  BREAK_MINUTES,
  COLOR_A_DEFAULT,
  COLOR_B_DEFAULT,
  LONG_BREAK_MINUTES,
  NUM_SESSIONS,
  SESSION_MINUTES,
} from "../constants";
import { playNotification } from "../util";

// TODO: figure out what we can use storage-wise on DeskThing Client, or get this from Server to avoid losing state on e.g. app switches
export interface PomodoroContextType {
  settings: PomodoroSettings;
  handleSettingsChange: (settings: PomodoroSettings) => void;
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
  children: ReactNode;
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<PomodoroSettings>({
    numSessions: NUM_SESSIONS,
    sessionMinutes: SESSION_MINUTES,
    shortBreakMinutes: BREAK_MINUTES,
    longBreakMinutes: LONG_BREAK_MINUTES,
    audioEnabled: true,
    colorA: COLOR_A_DEFAULT,
    colorB: COLOR_B_DEFAULT,
  });
  const [currentSession, setCurrentSession] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<TimerMode | BreakType>(
    "session"
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(
    settings.sessionMinutes * 60
  );
  const [isComplete, setIsComplete] = useState<boolean>(false);

  function handlePause() {
    setIsPaused((prev) => !prev);
  }

  function startSession(sessionNum: number) {
    setIsComplete(false);
    setCurrentMode("session");
    setCurrentSession(Math.max(sessionNum, 0));
    setTimeLeftSec(settings.sessionMinutes * 60);
  }

  function startBreak(sessionNum: number, breakType: BreakType) {
    setCurrentSession(Math.max(sessionNum, 0));
    setIsComplete(false);
    setCurrentMode(breakType);
    switch (breakType) {
      case "short-break":
        setTimeLeftSec(settings.shortBreakMinutes * 60);
        break;
      case "long-break":
        setTimeLeftSec(settings.longBreakMinutes * 60);
        break;
      default:
        throw new Error("Unimplemented breakType");
    }
  }

  function endLongBreak() {
    setTimeLeftSec(0);
    setIsComplete(true);
    setIsPaused(true);
    playNotification();
  }

  function resetCurrent() {
    setIsComplete(false);
    switch (currentMode) {
      case "session":
        startSession(currentSession);
        break;
      case "long-break":
      case "short-break":
        startBreak(currentSession, currentMode);
        break;
    }
  }

  const handlePrevious = () => {
    // Special case: left click on first session ALWAYS ONLY restarts first session
    if (currentMode === "session" && currentSession === 0) {
      resetCurrent();
      return;
    }
    // If pressed at start of a break, go back one session (this handles "double click" behavior)
    if (
      (currentMode === "short-break" &&
        timeLeftSec === settings.shortBreakMinutes * 60) ||
      (currentMode === "long-break" &&
        timeLeftSec === settings.longBreakMinutes * 60)
    ) {
      startSession(currentSession - 1);
      return;
    }

    // If pressed at start of a session, go back one break (this handles "double click" behavior)
    if (
      currentMode === "session" &&
      timeLeftSec === settings.sessionMinutes * 60
    ) {
      startBreak(currentSession - 1, "short-break"); // You can never go backwards from session to long break, since there is no session after long break
      return;
    }

    // Otherwise, restart current
    resetCurrent();
  };

  const handleNext = () => {
    // Case 1: right click during session. Go to next break
    if (currentMode === "session") {
      startBreak(
        currentSession,
        currentSession === settings.numSessions - 1
          ? "long-break"
          : "short-break"
      );
    }
    // Case 2: right click on any short break. Go to next session
    else if (currentMode === "short-break") {
      startSession(currentSession + 1);
    }
    // Case 3: when long break ends, overall session is complete
    else if (currentMode === "long-break") {
      endLongBreak();
    } else {
      console.error("Unhandled handleNext state");
    }
  };

  const handleReset = () => {
    startSession(0);
    setIsPaused(false);
  };

  // Use a ref to keep track of the previous settings state
  const prevSettingsRef = useRef<PomodoroSettings>(settings);

  const handleSettingsChange = (newSettings: PomodoroSettings) => {
    setSettings(newSettings); // Update the state first
  };

  useEffect(() => {
    const prevSettings = prevSettingsRef.current;

    if (shouldReset(settings, prevSettings)) {
      handleReset();
    }

    // Update the ref with the current settings after checks
    prevSettingsRef.current = settings;
  }, [settings]);

  return (
    <PomodoroContext.Provider
      value={{
        settings,
        handleSettingsChange,
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

// Reset session when session-related config values are changed
// Otherwise, timer state might get a little wonky — e.g. user reduces numSessions to 2, when on #4
// Nice to have: More sophisticated logic here that combines *which* settings changed with the current state
function shouldReset(n: PomodoroSettings, o: PomodoroSettings): boolean {
  if (
    n.numSessions !== o.numSessions ||
    n.sessionMinutes !== o.sessionMinutes ||
    n.shortBreakMinutes !== o.shortBreakMinutes ||
    n.longBreakMinutes !== o.longBreakMinutes
  ) {
    return true;
  }
  return false;
}
