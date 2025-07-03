import { AppSettings, SETTING_TYPES, SettingsType } from '@deskthing/types'
import { DeskThing } from '@deskthing/server';

export const setupSettings = async (
  settings: AppSettings | null,
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
    (setting) => settings?.[setting]
  );

  if (!hasAllSettings) {
    log("setupSettings: missing setting, configuring");
    const Settings: AppSettings = {
      colorA: {
        label: "Color A",
        id: 'colorA',
        description: "Background Color A (Left)",
        type: SETTING_TYPES.COLOR,
        value: "#2dd4bf",
      },
      colorB: {
        label: "Color B",
        id: 'colorB',
        description: "Background Color B (Right)",
        type: SETTING_TYPES.COLOR,
        value: "#fef08a",
      },
      numSessions: {
        label: "Focus Blocks",
        id: 'numSessions',
        description: "The number of focus blocks in your session",
        type: SETTING_TYPES.NUMBER,
        value: 4,
        min: 1,
        max: 10,
      },
      sessionLength: {
        label: "Focus Block Length (min)",
        id: 'sessionLength',
        description: "The length of the focus blocks, in minutes",
        type: SETTING_TYPES.NUMBER,
        value: 25,
        min: 1,
        max: 60,
      },
      shortBreakLength: {
        label: "Short Break Length (min)",
        id: 'shortBreakLength',
        description: "The length of the short breaks, in minutes",
        type: SETTING_TYPES.NUMBER,
        value: 5,
        min: 1,
        max: 60,
      },
      longBreakLength: {
        label: "Long Break Length (min)",
        id: 'longBreakLength',
        description: "The length of the long break, in minutes",
        type: SETTING_TYPES.NUMBER,
        value: 20,
        min: 1,
        max: 60,
      },
      audioEnabled: {
        label: "Enable Audio Notifications?",
        id: 'audioEnabled',
        description:
          "If set to true, a ding will play at the end of every block",
        type: SETTING_TYPES.BOOLEAN,
        value: true,
      },
    };

    log(`setupSettings: Initializing settings`)

    DeskThing.initSettings(Settings);


  } else {
    log(`setupSettings: all settings configured. Has ${settings && Object.keys(settings).length} settings`);
  }
};
