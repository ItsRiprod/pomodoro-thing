import { DataInterface, DeskThing, IncomingEvent } from "deskthing-server";
import { setupSettings } from "./settings";
import { notify } from "./notify";
import { APP_ID } from "../src/constants";

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

  let latestTimerValue: number | undefined;

  setInterval(function () {
    if (latestTimerValue) latestTimerValue = latestTimerValue - 1;
  }, 1000);

  DeskThing.on("timerState" as IncomingEvent, async (data) => {
    // sendLog(
    //   "timerState data received on server: " +
    //     JSON.stringify(data, undefined, 2)
    // );

    latestTimerValue = data.payload.timeLeftSec;
    sendLog(
      "current latestTimerValue on server: " +
        JSON.stringify(latestTimerValue, undefined, 2)
    );
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
    if (data.request == "server-timer-state") {
      sendLog(
        "get server-timer-state: Sending timer state: " + latestTimerValue
      );
      DeskThing.send({
        type: "server-timer-state",
        payload: latestTimerValue,
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
