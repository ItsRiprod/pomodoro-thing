import { AppSettings, DESKTHING_DEVICE, DEVICE_CLIENT } from "@deskthing/types";
import { createDeskThing } from "@deskthing/client";
import { coerceSettings, requirePomodoroContext } from "../util";
import { useEffect, useState } from "react";
import { CLIENT_SERVER, ClientToServerData, SERVER_CLIENT, ServerToClientData, type PomodoroSettings, type TimerMode, type TimerState } from "../types";
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


// This asserts e2e type safety between the client and server
const DeskThing = createDeskThing<ServerToClientData, ClientToServerData>()

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
    let initialRequest = true;
    const fetchSettingsFromServer = async () => {
      const serverData = await DeskThing.fetch(
        {
          type: CLIENT_SERVER.GET,
          request: SERVER_CLIENT.INITIAL_SETTINGS,
        },
        {
          type: SERVER_CLIENT.INITIAL_SETTINGS,
        }
      );

      // break if this is unmounted before the request resolves
      if (!initialRequest) return;

      console.log("Got the server data: ", serverData);

      let settings = DEFAULT_SETTINGS;
      if (serverData) {
        settings = coerceSettings(serverData.payload, handleError);
      } else {
        // Check deskthing for the settings as a fallback
        const serverSettings = await DeskThing.getSettings();
        // break if this is unmounted before the request resolves
        if (!initialRequest) return;
        if (serverSettings) {
          settings = coerceSettings(serverSettings, handleError);
        }
      }
      handleSettings("initial", settings);

      const serverState = await DeskThing.fetch(
        {
          type: CLIENT_SERVER.GET,
          request: SERVER_CLIENT.SERVER_TIMER_STATE
        },
        {
          type: SERVER_CLIENT.SERVER_TIMER_STATE
        }
      )

      setData("serverState payload " + JSON.stringify(serverState?.payload));

      // Default values to use if no saved server state:
      let timeToStart = settings.sessionMinutes * 60;
      let isPaused = true;
      let currentMode: TimerMode = "session";
      let currentSession: number = 0;
      let isComplete: boolean = false;

      // Use saved server state values if returned:
      if (serverState !== undefined && Object.keys(serverState).length > 0) {

        const timerState = serverState.payload

        if (!timerState) {
          console.debug('Got an undefined payload')
          return
        }

        timeToStart = Number(timerState.timeLeftSec);
        isPaused = timerState.isPaused;
        currentMode = timerState.currentMode;
        currentSession = timerState.currentSession;
        isComplete = timerState.isComplete;
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

    return () => {
      initialRequest = false
    }
  }, []);

  useEffect(() => {
    // Settings changes saved while running are sent from the server to the client:
    const offSettings = DeskThing.on(
      SERVER_CLIENT.SETTINGS_UPDATE,
      (data) => {
        console.debug(`DeskThingBridge: Settings Updated!`);
        handleSettings(
          "update",
          coerceSettings(data.payload as AppSettings, handleError)
        );
      }
    );

    // Also handle the normal settings update
    const off = DeskThing.on(DEVICE_CLIENT.SETTINGS, (data) => {
      console.debug(`DeskThingBridge: Settings Updated!`);
      handleSettings("update", coerceSettings(data.payload, handleError));
    });

    return () => {
      // cleanup listeners on re-render
      off();
      offSettings();
    };
  }, []);

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
