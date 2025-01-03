import ChevronRight from "./icons/ChevronRight";
import PlayCircle from "./icons/PlayCircle";
import PauseCircle from "./icons/PauseCircle";
import Refresh from "./icons/Refresh";
import { usePomodoroContext } from "../contexts/PomodoroContext";

export default function Controls() {
  const p = usePomodoroContext();
  if (!p) {
    throw new Error("Missing Pomodoro Context");
  }

  return (
    <div className="z-30 flex flex-row items-center space-x-1 text-white">
      <button
        className="focus:outline-none focus:ring-0 bg-transparent"
        onTouchStart={p.handlePrevious}
      >
        <ChevronRight className="size-[60px] cursor-pointer rotate-180" />
      </button>
      {/* TODO: refactor to use non-circle icons, so that all icons can be in a circle, including refresh */}
      {p.isComplete ? (
        <button
          className="focus:outline-none focus:ring-0 bg-transparent"
          onTouchStart={p.handleReset}
        >
          <Refresh className="size-[80px] cursor-pointer" />
        </button>
      ) : p.isPaused ? (
        <button
          className="focus:outline-none focus:ring-0 bg-transparent"
          onTouchStart={p.handlePause}
        >
          <PlayCircle className="size-[80px] cursor-pointer" />
        </button>
      ) : (
        <button
          className="focus:outline-none focus:ring-0 bg-transparent"
          onTouchStart={p.handlePause}
        >
          <PauseCircle className="size-[80px] cursor-pointer" />
        </button>
      )}
      <button
        className="focus:outline-none focus:ring-0 bg-transparent"
        onTouchStart={p.handleNext}
      >
        <ChevronRight className="size-[60px] cursor-pointer" />
      </button>
    </div>
  );
}
