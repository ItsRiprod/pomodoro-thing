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
  const Data = await DeskThing.getData();
  await setupSettings(Data);
};

const stop = async () => {
  sendLog("Server Stopped");
};

// TODO: Properly handle INITIAL SETTINGS on start. Maybe the client needs to fetch proactively first?
function handleData(data: DataInterface | null) {
  const settings = data?.settings;
  if (!settings) {
    sendError("handleData: No settings ");
    return;
  }

  DeskThing.send({
    type: "settings",
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
