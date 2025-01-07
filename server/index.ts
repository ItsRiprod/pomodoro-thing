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
};

const stop = async () => {
  sendLog("Server Stopped");
};

function handleData(data: DataInterface | null) {
  sendLog("handleData: running");
  const settings = data?.settings;
  if (!settings) {
    sendError("handleData: No settings ");
    return;
  }

  sendLog(
    "handleData: Sending settings: " + JSON.stringify(settings, undefined)
  );
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

DeskThing.on("get", async (data) => {
  if (data.request == "initial-settings") {
    const data = await DeskThing.getData();
    const settings = data?.settings;
    if (!settings) {
      sendError("get settings: No settings returned by DeskThing");
      return;
    }
    sendLog(
      "get settings: Sending settings: " + JSON.stringify(settings, undefined)
    );
    DeskThing.send({
      type: "initial-settings",
      payload: settings,
    });
  }
});

export { DeskThing };
