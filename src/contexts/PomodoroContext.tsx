import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CLIENT_SERVER,
  type BreakType,
  type ClientToServerData,
  type PomodoroSettings,
  type ServerToClientData,
  type TimerMode,
} from "../types";
import { playNotification } from "../util";
import { createDeskThing } from "@deskthing/client";

// This asserts e2e type safety between the client and server
const DeskThing = createDeskThing<ServerToClientData, ClientToServerData>();

export interface PomodoroContextType {
  settings: PomodoroSettings | null;
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
  const [settings, setSettings] = useState<PomodoroSettings | null>(null);
  const [currentSession, setCurrentSession] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<TimerMode | BreakType>(
    "session"
  );
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(
    (settings?.sessionMinutes ?? 0) * 60
  );
  const [isComplete, setIsComplete] = useState<boolean>(false);

  function handlePause() {
    setIsPaused((prev) => !prev);
  }

  // On state changes, sync the value to the server, so we can pick up where we left off after a background event
  useEffect(() => {
    if (settings) {
      DeskThing.send({
        type: CLIENT_SERVER.TIME_LEFT_SEC,
        payload: timeLeftSec,
        request: 'set'
      });
    }
  }, [timeLeftSec, setTimeLeftSec, settings]);

  useEffect(() => {
    if (settings) {
      DeskThing.send({
        type: CLIENT_SERVER.IS_PAUSED,
        payload: isPaused,
        request: 'set'
      });
    }
  }, [isPaused, setIsPaused, settings]);

  useEffect(() => {
    if (settings) {
      DeskThing.send({
        type: CLIENT_SERVER.CURRENT_MODE,
        payload: currentMode,
        request: 'set'
      });
    }
  }, [currentMode, setCurrentMode, settings]);

  useEffect(() => {
    if (settings) {
      DeskThing.send({
        type: CLIENT_SERVER.CURRENT_SESSION,
        payload: currentSession,
        request: 'set'
      });
    }
  }, [currentSession, setCurrentSession, settings]);

  useEffect(() => {
    if (settings) {
      DeskThing.send({
        type: CLIENT_SERVER.IS_COMPLETE,
        payload: isComplete,
        request: 'set'
      });
    }
  }, [isComplete, setIsComplete, settings]);

  function startSession(sessionNum: number) {
    if (!settings) return;
    setIsComplete(false);
    setCurrentMode("session");
    setCurrentSession(Math.max(sessionNum, 0));
    setTimeLeftSec(settings.sessionMinutes * 60);
  }

  function startBreak(sessionNum: number, breakType: BreakType) {
    if (!settings) return;
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
    if (!settings) return;
    setTimeLeftSec(0);
    setIsComplete(true);
    setIsPaused(true);
    playNotification();
  }

  function resetCurrent() {
    if (!settings) return;
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
    if (!settings) return;

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
    if (!settings) return;

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
    if (!settings) return;
    startSession(0);
  };

  const prevSettingsRef = useRef<PomodoroSettings | null>(settings);

  const handleSettingsChange = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
  };

  useEffect(() => {
    if (!settings) return;

    const prevSettings = prevSettingsRef.current;

    if (prevSettings && shouldReset(settings, prevSettings)) {
      handleReset();
    }

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
  return true;
  // if (
  //   n.numSessions !== o.numSessions ||
  //   n.sessionMinutes !== o.sessionMinutes ||
  //   n.shortBreakMinutes !== o.shortBreakMinutes ||
  //   n.longBreakMinutes !== o.longBreakMinutes
  // ) {
  //   return true;
  // }
  // return false;
}
