import Pause from "./icons/Pause";
import Play from "./icons/Play";
import Restart from "./icons/Restart";

export type ControlType = "play" | "pause" | "restart";

export default function ControlIcon({
  controlType,
  onClick,
}: {
  controlType: ControlType;
  onClick: () => void;
}) {
  return (
    <button
      onTouchStart={onClick}
      className="w-full focus:outline-none focus:ring-0 bg-transparent px-3 flex items-center justify-center"
    >
      <div className="size-[100px] rounded-full focus:outline-none focus:ring-0 bg-transparent border-[4px] border-white p-2 flex items-center justify-center">
        {getIconElem(controlType)}
      </div>
    </button>
  );
}

export function getIconElem(controlType: ControlType) {
  const iconClassName = "text-white size-[75px]";
  switch (controlType) {
    case "pause":
      return <Pause className={iconClassName} />;
    case "play":
      return <Play className={iconClassName + " ml-1"} />;
    case "restart":
      return <Restart className={iconClassName} />;
  }
}
