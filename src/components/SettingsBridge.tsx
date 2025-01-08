import { DeskThing, SocketData } from "deskthing-client";
import { coerceSettings, requirePomodoroContext } from "../util";
import { useEffect, useState } from "react";
import { PomodoroSettings } from "../types";
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

export default function SettingsBridge() {
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
    // setData(JSON.stringify({ source, ...settings }, undefined, 2));
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

      const serverState = await DeskThing.fetchData<SocketData>(
        "server-timer-state",
        {
          type: "get",
          request: "server-timer-state",
        }
      );

      setData("serverState payload " + JSON.stringify(serverState));

      const timeToStart = serverState
        ? Number(serverState)
        : settings.sessionMinutes * 60;

      p.setTimeLeftSec(timeToStart);
      p.setIsPaused(false);
    };

    fetchSettingsFromServer();
  }, []);

  useEffect(() => {
    // Settings changes saved while running are sent from the server to the client:
    DeskThing.on("settings-update", (data) => {
      handleSettings("update", coerceSettings(data.payload, handleError));
    });
  });

  // TODO: change back to based on dev mode
  return true ? (
    <div className="h-[250px] text-black bg-white">
      <pre>
        <code>{data}</code>
      </pre>
    </div>
  ) : (
    <></>
  );
}
