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
  setupSettings(Data);
};

const stop = async () => {
  sendLog("Server Stopped");
};

function handleData(data: DataInterface) {
  const settings = data.settings;
  if (!settings) {
    sendError("handleData: No settings ");
    return;
  }

  if (settings.colorA) {
    sendLog("new colorA :" + settings.colorA.value);
    DeskThing.send({
      type: "colorA",
      payload: settings.colorA.value as string,
    });
  }

  if (settings.colorB) {
    sendLog("new colorB :" + settings.colorB.value);
    DeskThing.send({
      type: "colorB",
      payload: settings.colorB.value as string,
    });
  }
}

DeskThing.on("start", start);
DeskThing.on("stop", stop);
DeskThing.on("data", handleData);
DeskThing.on("notify" as IncomingEvent, () => {
  notify({ onError: sendError });
});

export { DeskThing };
