import { requirePomodoroContext } from "../util";
import ControlIcon from "./ControlIcon";
import StageIcon from "./StageIcon";

export default function Controls() {
  const p = requirePomodoroContext();

  return (
    <div className="z-30 flex flex-row items-center space-x-1 text-white">
      <StageIcon controlType="prev" onClick={() => p.handlePrevious()} />
      <MainControl />
      <StageIcon controlType="next" onClick={() => p.handleNext()} />
    </div>
  );
}

function MainControl() {
  const p = requirePomodoroContext();

  return p.isComplete ? (
    <ControlIcon onClick={p.handleReset} controlType="restart" />
  ) : p.isPaused ? (
    <ControlIcon onClick={p.handlePause} controlType="play" />
  ) : (
    <ControlIcon onClick={p.handlePause} controlType="pause" />
  );
}
