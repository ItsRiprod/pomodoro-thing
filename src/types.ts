import { AppSettings } from "@deskthing/types";

export type TimerMode = "session" | "short-break" | "long-break";
export type BreakType = "short-break" | "long-break";
export type PomodoroSettings = {
  devMode: boolean;
  numSessions: number;
  sessionMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  audioEnabled: boolean;
  colorA: string;
  colorB: string;
};

export type TimerState = {
  timeLeftSec: number;
  isPaused: boolean;
  currentMode: TimerMode;
  currentSession: number;
  isComplete: boolean;
};

// The following types magic will allow DeskThing to be e2e types - i got a little confused trying to ensure everything was working properly - so this was the easiest way to do it


export enum SERVER_CLIENT {
  INITIAL_SETTINGS = "initial-settings",
  SERVER_TIMER_STATE = "server-timer-state",
  SETTINGS_UPDATE = "settings-update"
}

export type ServerToClientData = (
  | {
    type: SERVER_CLIENT.INITIAL_SETTINGS
    payload: AppSettings
  }
  | {
    type: SERVER_CLIENT.SERVER_TIMER_STATE
    payload: TimerState | undefined
  }
  | {
    type: SERVER_CLIENT.SETTINGS_UPDATE
    payload: AppSettings
  }
)

export enum CLIENT_SERVER {
  GET = "get",
  NOTIFY = "notify",
  TIME_LEFT_SEC = "timeLeftSec",
  IS_PAUSED = "isPaused",
  CURRENT_MODE = "currentMode",
  CURRENT_SESSION = "currentSession",
  IS_COMPLETE = "isComplete"
}

export type ClientToServerData = 
  | {
    type: CLIENT_SERVER.GET
    request: SERVER_CLIENT.SERVER_TIMER_STATE
  }
  | {
    type: CLIENT_SERVER.GET
    request: SERVER_CLIENT.INITIAL_SETTINGS
  }
  | {
    type: CLIENT_SERVER.NOTIFY
    request: 'set' // needed for correctly typing - does not have to be used
  }
  | {
    type: CLIENT_SERVER.TIME_LEFT_SEC
    request: 'set' // needed for correctly typing - does not have to be used
    payload: number
  }
  | {
    type: CLIENT_SERVER.IS_COMPLETE
    request: 'set' // needed for correctly typing - does not have to be used
    payload: boolean
  }
  | {
    type: CLIENT_SERVER.IS_PAUSED
    request: 'set' // needed for correctly typing - does not have to be used
    payload: boolean
  }
  | {
    type: CLIENT_SERVER.CURRENT_MODE
    request: 'set' // needed for correctly typing - does not have to be used
    payload: TimerMode
  }
  | {
    type: CLIENT_SERVER.CURRENT_SESSION
    request: 'set' // needed for correctly typing - does not have to be used
    payload: number
  }