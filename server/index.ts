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

  // TODO: store additional Properties
  let timeLeftSec: number | undefined;
  let isPaused: boolean | undefined;
  let currentMode: TimerMode | undefined;
  let currentSession: number | undefined;
  let isComplete: boolean | undefined;

  // We run a timer on the server, as a fallback for when the client-side app is backgrounded
  // TODO: handleNext equivalent on server
  setInterval(function () {
    if (timeLeftSec && !isPaused) timeLeftSec = timeLeftSec - 1;
  }, 1000);

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
      sendLog(
        "get settings: Sending settings: " +
          JSON.stringify(settings, undefined, 2)
      );
      DeskThing.send({
        type: "initial-settings",
        payload: settings,
      });
    }

    // server-timer-state
    // TODO: send back additional properties
    if (data.request == "server-timer-state") {
      sendLog("get server-timer-state: Sending timer state: " + timeLeftSec);
      DeskThing.send({
        type: "server-timer-state",
        payload: {
          timeLeftSec,
          isPaused,
          currentMode,
          currentSession,
          isComplete,
        },
      });
    }
  });
};

const stop = async () => {
  sendLog("Server Stopped");
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
}

DeskThing.on("start", start);
DeskThing.on("stop", stop);
DeskThing.on("data", handleData);
DeskThing.on("notify" as IncomingEvent, async () => {
  const Data = await DeskThing.getData();
  if (Data?.settings?.audioEnabled.value) {
    DeskThing.sendLog("Notifying");
    notify({ onError: sendError });
  } else {
    DeskThing.sendLog("Audio disabled. Skipping notification");
  }
});

export { DeskThing };
