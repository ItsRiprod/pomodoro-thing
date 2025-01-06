import clsx from "clsx";
import ChevronRight from "./icons/ChevronRight";

type StageControlType = "prev" | "next";

export default function StageIcon({
  controlType,
  onClick,
}: {
  controlType: StageControlType;
  onClick: () => void;
}) {
  return (
    <button
      className="focus:outline-none focus:ring-0 bg-transparent"
      onTouchStart={onClick}
    >
      <ChevronRight
        className={clsx(
          "size-[85px] cursor-pointer",
          controlType === "prev" && "rotate-180"
        )}
      />
    </button>
  );
}
