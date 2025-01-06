import { useEffect } from "react";
import { formatTime, requirePomodoroContext } from "../util";
import { MAX_MINUTES, TIMER_INTERVAL } from "../constants";
import { useDebouncedCallback } from "use-debounce";

export default function Timer() {
  const p = requirePomodoroContext();

  const incrementMinutes = () => {
    const newMinutesLeft = Math.floor(p.timeLeftSec / 60) + 1;
    if (newMinutesLeft <= MAX_MINUTES) {
      p.setTimeLeftSec(newMinutesLeft * 60);
    } else {
      p.setTimeLeftSec(MAX_MINUTES * 60);
    }
  };

  const debouncedIncrement = useDebouncedCallback(incrementMinutes, 10);

  const decrementMinutes = () => {
    const newMinutesLeft = Math.floor(p.timeLeftSec / 60) - 1;
    if (newMinutesLeft >= 0) {
      p.setTimeLeftSec(newMinutesLeft * 60);
    } else {
      p.setTimeLeftSec(0);
    }
  };

  const debouncedDecrement = useDebouncedCallback(decrementMinutes, 10);

  // Set up timer, which can be paused/unpaused based on isPaused
  useEffect(() => {
    const timer = setInterval(() => {
      if (!p.isPaused) {
        const nextValue = p.timeLeftSec - 1;
        if (nextValue <= 0) {
          p.handleNext();
        } else {
          p.setTimeLeftSec((prev) => Math.max(prev - 1, 0));
        }
      }
    }, TIMER_INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, [p.isPaused, p.timeLeftSec]);

  // Set up a listener for wheel events, to allow user to manually adjust the timer up/down
  useEffect(() => {
    document.addEventListener("wheel", (e) => {
      const isUp = e.deltaX > 0 || e.deltaY < 0;
      if (isUp) {
        debouncedDecrement();
      } else {
        debouncedIncrement();
      }
    });
  }, []);

  return (
    <p className="z-30 font-bold text-[140px] text-white">
      {formatTime(p.timeLeftSec)}
    </p>
  );
}
