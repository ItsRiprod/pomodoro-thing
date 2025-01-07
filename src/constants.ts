// Set IS_DEV to true to run timer in "fast mode", to easily check different behaviors
export const IS_DEV = true; // MUSTFIX: set to false before releasing

export const APP_ID = "pomodoro-timer";
export const NUM_SESSIONS = 4;
export const MAX_MINUTES = 180;
export const SESSION_MINUTES = IS_DEV ? 1 : 25;
export const BREAK_MINUTES = IS_DEV ? 0.5 : 5;
export const LONG_BREAK_MINUTES = IS_DEV ? 1 : 20;
export const TIMER_INTERVAL = IS_DEV ? 100 : 1000;
export const COLOR_A_DEFAULT = "#2dd4bf";
export const COLOR_B_DEFAULT = "#fef08a";
