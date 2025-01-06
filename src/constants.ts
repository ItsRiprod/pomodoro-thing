// TODO: get this stuff from DeskThing config values
export const APP_ID = "pomodoro-timer";
const IS_DEV = false; // Set to true to run timer in "fast mode", to easily check different behaviors
export const NUM_SESSIONS = 4;
export const MAX_MINUTES = 60;
const SESSION_MINUTES = IS_DEV ? 1 : 25;
export const SESSION_SECONDS = SESSION_MINUTES * 60;
const BREAK_MINUTES = IS_DEV ? 0.5 : 5;
export const BREAK_SECONDS = BREAK_MINUTES * 60;
const LONG_BREAK_MINUTES = IS_DEV ? 1 : 20;
export const LONG_BREAK_SECONDS = LONG_BREAK_MINUTES * 60;
export const TIMER_INTERVAL = IS_DEV ? 100 : 1000;
