import { createDeskThing } from '@deskthing/server';
import { setupSettings } from "./settings";
import { notify } from "./notify";
import { APP_ID } from "../src/constants";
import { CLIENT_SERVER, SERVER_CLIENT, type ClientToServerData, type ServerToClientData, type TimerMode } from "../src/types";
import { AppDataInterface, AppSettings, DESKTHING_EVENTS, SavedData } from '@deskthing/types';

// This is for cleaning up the listeners when the app is stopped
let cleanupFunctions: (() => void)[] = []

const DeskThing = createDeskThing<ClientToServerData, ServerToClientData>();

function prefixMessage(message: string): string {
  return `${APP_ID}: ${message}`;
}

function sendLog(message: string) {
  console.log(prefixMessage(message));
}

function sendError(message: string) {
  console.error(prefixMessage(message));
}

const start = async () => {
  sendLog("Server Started");
  const settings = await DeskThing.getSettings();
  await setupSettings(settings, sendLog);

  let timeLeftSec: number | undefined = undefined;
  let startTimestamp: number | undefined = undefined;
  let isPaused: boolean | undefined = undefined;
  let currentMode: TimerMode = "session";
  let currentSession: number = 0;
  let isComplete: boolean = false;
  let hasTimerStarted: boolean = false;

  const handleReset = () => {
    timeLeftSec = settings?.sessionLength
      ? (settings?.sessionLength.value as number) * 60
      : undefined;
    currentMode = "session";
    currentSession = 0;
    isComplete = false;
  };

  function handleSettings(settings: AppSettings | null) {
    if (!settings) {
      sendError("handleData: No settings ");
      return;
    }

    DeskThing.send({
      type: SERVER_CLIENT.SETTINGS_UPDATE,
      payload: settings,
    });

    handleReset();
  }

  const handleNotify = async () => {
    const settings = await DeskThing.getSettings();
    if (settings?.audioEnabled.value) {
      console.log("Playing audio notification");
      notify({ onError: sendError });
    } else {
      console.log("Audio disabled. Skipping notification");
    }
  };

  // We run a timer on the server, as a fallback for when the client-side app is backgrounded
  // Uses the deskthing server's background task loop so that it can be cancelled when the app is paused or killed
  DeskThing.setInterval(async () => {
    if (timeLeftSec && !isPaused) {
      if (startTimestamp === undefined) {
        startTimestamp = Date.now();
      }
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
      startTimestamp = now;
      timeLeftSec = timeLeftSec - elapsedSeconds;

      hasTimerStarted = true;

      // Rough equivalent of handleNext on client
      if (timeLeftSec === 0) {
        // Set next mode. Depends on current mode + total number of sessions configured
        if (currentMode === "session") {
          const settings = await DeskThing.getSettings();
          if (
            currentSession ===
            Number(settings?.numSessions.value ?? 0) - 1
          ) {
            currentMode = "long-break";
            isComplete = false;
            timeLeftSec = settings?.longBreakLength
              ? (settings?.longBreakLength.value as number) * 60
              : 0;
          } else {
            currentMode = "short-break";
            isComplete = false;
            timeLeftSec = settings?.shortBreakLength
              ? (settings?.shortBreakLength.value as number) * 60
              : 0;
          }
        } else if (currentMode === "short-break") {
          const settings = await DeskThing.getSettings();
          currentMode = "session";
          isComplete = false;
          currentSession = (currentSession ?? 0) + 1;
          timeLeftSec = (settings?.sessionLength.value as number) * 60;
        } else if (currentMode === "long-break") {
          timeLeftSec = 0;
          isComplete = true;
          isPaused = true;
        }
      }
    } else if (isPaused) {
      startTimestamp = undefined;
    }
  }, 1000);

  const fun1 = DeskThing.on(CLIENT_SERVER.TIME_LEFT_SEC, async (data) => {
    timeLeftSec = data.payload;
  });
  cleanupFunctions.push(fun1);

  const fun2 = DeskThing.on(CLIENT_SERVER.IS_PAUSED, async (data) => {
    isPaused = data.payload ?? false;
  });
  cleanupFunctions.push(fun2);

  const fun3 = DeskThing.on(CLIENT_SERVER.CURRENT_MODE, async (data) => {
    currentMode = data.payload;
  });
  cleanupFunctions.push(fun3);

  const fun4 = DeskThing.on(CLIENT_SERVER.CURRENT_SESSION, async (data) => {
    currentSession = data.payload;
  });
  cleanupFunctions.push(fun4);

  const fun5 = DeskThing.on(CLIENT_SERVER.IS_COMPLETE, async (data) => {
    isComplete = data.payload;
  });
  cleanupFunctions.push(fun5);

  const fun6 = DeskThing.on(CLIENT_SERVER.GET, async (data) => {
    // initial-settings
    if (data.request == SERVER_CLIENT.INITIAL_SETTINGS) {
      const settings = await DeskThing.getSettings();
      if (!settings) {
        sendError("get settings: No settings returned by DeskThing");
        return;
      }
      DeskThing.send({
        type: SERVER_CLIENT.INITIAL_SETTINGS,
        payload: settings,
      });
    }

    // server-timer-state
    if (data.request == SERVER_CLIENT.SERVER_TIMER_STATE) {
      DeskThing.send({
        type: SERVER_CLIENT.SERVER_TIMER_STATE,
        payload: hasTimerStarted
          ? {
              timeLeftSec: timeLeftSec || 0,
              isPaused: isPaused || false,
              currentMode,
              currentSession,
              isComplete,
            }
          : undefined,
      });
    }
  });
  cleanupFunctions.push(fun6);

  const fun7 = DeskThing.on(CLIENT_SERVER.NOTIFY, () => {
    handleNotify();
  });
  cleanupFunctions.push(fun7);

  const fun8 = DeskThing.on(DESKTHING_EVENTS.SETTINGS, (data) => handleSettings(data.payload));
  cleanupFunctions.push(fun8);
};

const stop = async () => {
  sendLog("Server Stopped");

  // cleanup all the listeners so they dont get defined multiple times
  cleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
  cleanupFunctions = [];
};

DeskThing.on(DESKTHING_EVENTS.START, start);
DeskThing.on(DESKTHING_EVENTS.STOP, stop);

