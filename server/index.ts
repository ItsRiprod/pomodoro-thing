import { DataInterface, DeskThing, IncomingEvent } from "deskthing-server";
import { setupSettings } from "./settings";
import { notify } from "./notify";
import { APP_ID } from "../src/constants";
import { type TimerMode } from "../src/types";

function prefixMessage(message: string): string {
  return `${APP_ID}: ${message}`;
}

function sendLog(message: string) {
  DeskThing.sendLog(prefixMessage(message));
}

function sendError(message: string) {
  DeskThing.sendError(prefixMessage(message));
}

const start = async () => {
  sendLog("Server Started");
  const data = await DeskThing.getData();
  await setupSettings(data, sendLog);

  let timeLeftSec: number | undefined = undefined;
  let isPaused: boolean | undefined = undefined;
  let currentMode: TimerMode = "session";
  let currentSession: number = 0;
  let isComplete: boolean = false;
  let hasTimerStarted: boolean = false;

  const handleReset = () => {
    timeLeftSec = data?.settings?.sessionLength
      ? (data?.settings?.sessionLength.value as number) * 60
      : undefined;
    currentMode = "session";
    currentSession = 0;
    isComplete = false;
  };

  function handleData(data: DataInterface | null) {
    const settings = data?.settings;
    if (!settings) {
      sendError("handleData: No settings ");
      return;
    }

    DeskThing.send({
      type: "settings-update",
      payload: settings,
    });

    handleReset();
  }

  const handleNotify = async () => {
    const data = await DeskThing.getData();
    if (data?.settings?.audioEnabled.value) {
      DeskThing.sendLog("Playing audio notification");
      notify({ onError: sendError });
    } else {
      DeskThing.sendLog("Audio disabled. Skipping notification");
    }
  };

  // We run a timer on the server, as a fallback for when the client-side app is backgrounded
  // Uses the deskthing server's background task loop so that it can be cancelled when the app is paused or killed 
  DeskThing.addBackgroundTaskLoop(async () => {
    if (timeLeftSec && !isPaused) {
      timeLeftSec = timeLeftSec - 1;
      hasTimerStarted = true;

      // Rough equivalent of handleNext on client
      if (timeLeftSec === 0) {
        // Set next mode. Depends on current mode + total number of sessions configured
        if (currentMode === "session") {
          const data = await DeskThing.getData();
          if (
            currentSession ===
            Number(data?.settings?.numSessions.value ?? 0) - 1
          ) {
            currentMode = "long-break";
            isComplete = false;
            timeLeftSec = data?.settings?.longBreakLength
              ? (data?.settings?.longBreakLength.value as number) * 60
              : 0;
          } else {
            currentMode = "short-break";
            isComplete = false;
            timeLeftSec = data?.settings?.shortBreakLength
              ? (data?.settings?.shortBreakLength.value as number) * 60
              : 0;
          }
        } else if (currentMode === "short-break") {
          const data = await DeskThing.getData();
          currentMode = "session";
          isComplete = false;
          currentSession = (currentSession ?? 0) + 1;
          timeLeftSec = (data?.settings?.sessionLength.value as number) * 60;
        } else if (currentMode === "long-break") {
          timeLeftSec = 0;
          isComplete = true;
          isPaused = true;
        }
      }
    }
  }, 1000)

  DeskThing.on("timeLeftSec" as IncomingEvent, async (data) => {
    timeLeftSec = data.payload;
  });

  DeskThing.on("isPaused" as IncomingEvent, async (data) => {
    isPaused = data.payload ?? false;
  });

  DeskThing.on("currentMode" as IncomingEvent, async (data) => {
    currentMode = data.payload;
  });

  DeskThing.on("currentSession" as IncomingEvent, async (data) => {
    currentSession = data.payload;
  });

  DeskThing.on("isComplete" as IncomingEvent, async (data) => {
    isComplete = data.payload;
  });

  DeskThing.on("get", async (data) => {
    // initial-settings
    if (data.request == "initial-settings") {
      const data = await DeskThing.getData();
      const settings = data?.settings;
      if (!settings) {
        sendError("get settings: No settings returned by DeskThing");
        return;
      }
      DeskThing.send({
        type: "initial-settings",
        payload: settings,
      });
    }

    // server-timer-state
    if (data.request == "server-timer-state") {
      DeskThing.send({
        type: "server-timer-state",
        payload: hasTimerStarted
          ? {
              timeLeftSec,
              isPaused,
              currentMode,
              currentSession,
              isComplete,
            }
          : undefined,
      });
    }
  });

  DeskThing.on("notify" as IncomingEvent, () => {
    handleNotify();
  });

  DeskThing.on("data", handleData);
};

const stop = async () => {
  sendLog("Server Stopped");
};

DeskThing.on("start", start);
DeskThing.on("stop", stop);

export { DeskThing };
