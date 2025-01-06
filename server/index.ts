import { DeskThing, IncomingEvent, SocketData } from "deskthing-server";
import { setupSettings } from "./settings";
import { sendImage, sendSampleData } from "./sendingData";
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

const handleRequest = async (socketData: SocketData) => {
  switch (socketData.request) {
    case "sampleData":
      sendSampleData();
      break;
    case "image":
      sendImage();
      break;
    default:
      sendError("Invalid Request");
      break;
  }
};

DeskThing.on("get", handleRequest);
DeskThing.on("start", start);
DeskThing.on("stop", stop);
DeskThing.on("notify" as IncomingEvent, () => {
  notify({ onError: sendError });
});
export { DeskThing };
