import { DeskThing, DataInterface, SettingsType } from "deskthing-server";

export const setupSettings = async (
  Data: DataInterface | null,
  log: (message: string) => void
) => {
  const requiredSettings = [
    "colorA",
    "colorB",
    "numSessions",
    "sessionLength",
    "shortBreakLength",
    "longBreakLength",
    "audioEnabled",
  ];

  const hasAllSettings = requiredSettings.every(
    (setting) => Data?.settings?.[setting]
  );

  if (!hasAllSettings) {
    log("setupSettings: missing setting, configuring");
    const Settings: { [key: string]: SettingsType } = {
      colorA: {
        label: "Color A",
        description: "Background Color A (Left)",
        type: "color",
        value: "#2dd4bf",
      },
      colorB: {
        label: "Color B",
        description: "Background Color B (Right)",
        type: "color",
        value: "#fef08a",
      },
      numSessions: {
        label: "Sessions",
        description: "The number of focus blocks in your session",
        type: "number",
        value: 4,
        min: 1,
        max: 10,
      },
      sessionLength: {
        label: "Focus Block Length (min)",
        description: "The length of the focus blocks, in minutes",
        type: "number",
        value: 25,
        min: 1,
        max: 60,
      },
      shortBreakLength: {
        label: "Short Break Length (min)",
        description: "The length of the short breaks, in minutes",
        type: "number",
        value: 5,
        min: 1,
        max: 60,
      },
      longBreakLength: {
        label: "Long Break Length (min)",
        description: "The length of the long break, in minutes",
        type: "number",
        value: 20,
        min: 1,
        max: 60,
      },
      audioEnabled: {
        label: "Enable Audio Notifications?",
        description:
          "If set to true, a ding will play at the end of every block",
        type: "boolean",
        value: true,
      },
    };

    DeskThing.addSettings(Settings);
  } else {
    log("setupSettings: all settings configured");
  }
};
