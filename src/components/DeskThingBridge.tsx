import { DeskThing, SocketData } from "deskthing-client";
import { coerceSettings, requirePomodoroContext } from "../util";
import { useEffect, useState } from "react";
import type { PomodoroSettings, TimerMode } from "../types";
import {
  BREAK_MINUTES,
  COLOR_A_DEFAULT,
  COLOR_B_DEFAULT,
  IS_DEV,
  LONG_BREAK_MINUTES,
  NUM_SESSIONS,
  SESSION_MINUTES,
} from "../constants";

const DEFAULT_SETTINGS = {
  devMode: IS_DEV,
  numSessions: NUM_SESSIONS,
  sessionMinutes: SESSION_MINUTES,
  shortBreakMinutes: BREAK_MINUTES,
  longBreakMinutes: LONG_BREAK_MINUTES,
  audioEnabled: true,
  colorA: COLOR_A_DEFAULT,
  colorB: COLOR_B_DEFAULT,
};

export default function DeskThingBridge() {
  const [data, setData] = useState<any>(null);
  const p = requirePomodoroContext();

  const setCssProperty = (property: string, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(property, value);
  };

  const handleSettings = (
    source: "initial" | "update",
    settings: PomodoroSettings
  ) => {
    setCssProperty("--themeA", settings.colorA);
    setCssProperty("--themeB", settings.colorB);
    p.handleSettingsChange(settings);
    setData(JSON.stringify({ source, ...settings }, undefined, 2));
  };

  const handleError = () => {};

  // Initial settings are configured by a proactive call to the server to fetch settings data on mount:
  useEffect(() => {
    const fetchSettingsFromServer = async () => {
      const serverData = await DeskThing.fetchData<SocketData>(
        "initial-settings",
        {
          type: "get",
          request: "initial-settings",
        }
      );
      let settings = DEFAULT_SETTINGS;
      if (serverData) {
        settings = coerceSettings(serverData, handleError);
      }
      handleSettings("initial", settings);

      const serverState: any = await DeskThing.fetchData("server-timer-state", {
        type: "get",
        request: "server-timer-state",
      });

      setData("serverState payload " + JSON.stringify(serverState));

      // Default values to use if no saved server state:
      let timeToStart = settings.sessionMinutes * 60;
      let isPaused = true;
      let currentMode: TimerMode = "session";
      let currentSession: number = 0;
      let isComplete: boolean = false;

      // Use saved server state values if returned:
      if (serverState !== undefined && Object.keys(serverState).length > 0) {
        timeToStart = Number(serverState.timeLeftSec);
        isPaused = serverState.isPaused;
        currentMode = serverState.currentMode;
        currentSession = serverState.currentSession;
        isComplete = serverState.isComplete;
        if (isComplete) {
          timeToStart = 0;
          isPaused = true;
        }
      }

      p.setTimeLeftSec(timeToStart);
      p.setIsPaused(isPaused);
      p.setCurrentMode(currentMode);
      p.setCurrentSession(currentSession);
      p.setIsComplete(isComplete);
    };

    fetchSettingsFromServer();
  }, []);

  useEffect(() => {
    // Settings changes saved while running are sent from the server to the client:
    DeskThing.on("settings-update", (data) => {
      handleSettings("update", coerceSettings(data.payload, handleError));
    });
  });

  return p.settings?.devMode ? (
    <div className="h-[75px] text-black bg-white">
      <pre>
        <code>{data}</code>
      </pre>
    </div>
  ) : (
    <></>
  );
}
