import { DeskThing } from "deskthing-client";
import { PomodoroSettings } from "../types";
import { requirePomodoroContext } from "../util";

export default function ConfigBridge() {
  const p = requirePomodoroContext();

  const setCssProperty = (property: string, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(property, value);
  };

  function coerceSettings(data: any): PomodoroSettings {
    if (!data.numSessions || !data.numSessions.value) {
      DeskThing.send({
        type: "error",
        payload: "Missing numSessions Setting",
      });
    }

    if (!data.sessionLength || !data.sessionLength.value) {
      DeskThing.send({
        type: "error",
        payload: "Missing sessionLength Setting",
      });
    }

    if (!data.shortBreakLength || !data.shortBreakLength.value) {
      DeskThing.send({
        type: "error",
        payload: "Missing shortBreakLength Setting",
      });
    }

    if (!data.longBreakLength || !data.longBreakLength.value) {
      DeskThing.send({
        type: "error",
        payload: "Missing longBreakLength Setting",
      });
    }

    if (!data.audioEnabled) {
      DeskThing.send({
        type: "error",
        payload: "Missing audioEnabled Setting",
      });
    }

    if (!data.colorA || !data.colorA.value) {
      DeskThing.send({
        type: "error",
        payload: "Missing Color A Setting",
      });
    }

    if (!data.colorB || !data.colorB.value) {
      DeskThing.send({
        type: "error",
        payload: "Missing Color B Setting",
      });
    }

    return {
      numSessions: data.numSessions.value,
      sessionMinutes: data.sessionLength.value,
      shortBreakMinutes: data.shortBreakLength.value,
      longBreakMinutes: data.longBreakLength.value,
      audioEnabled: data.audioEnabled.value,
      colorA: data.colorA.value,
      colorB: data.colorB.value,
    };
  }

  DeskThing.on("settings", (data) => {
    const settings = coerceSettings(data.payload);
    setCssProperty("--themeA", settings.colorA);
    setCssProperty("--themeB", settings.colorB);
    p.handleSettingsChange(settings);
  });

  return <></>;
}
