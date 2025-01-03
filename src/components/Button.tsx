import clsx from "clsx";

export type Intent = "primary" | "secondary";

export default function Button({
  intent = "primary",
  onClick,
  children,
}: {
  intent?: Intent;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={clsx(
        "rounded-xl text-white w-[160px] font-medium transition-colors duration-200 flex focus:ring-0 focus:outline-none",
        buttonStyles(intent)
      )}
      onTouchStart={() => {
        onClick();
      }}
    >
      <div className="text-[32px] z-30 rounded-xl w-full h-full bg-transparent transition-all duration-200 py-2.5">
        {children}
      </div>
    </button>
  );
}

function buttonStyles(intent: Intent): string {
  switch (intent) {
    case "primary":
      return "bg-theme-a";
    case "secondary":
      return "bg-transparent border border-gray-100";
    default:
      throw new Error("unimplemented intent");
  }
}
