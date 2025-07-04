import React, { useEffect } from "react";
import { SocketData } from '@deskthing/types'
import { DeskThing } from '@deskthing/client';
import SessionOverview from "./components/SessionOverview";
import Controls from "./components/Controls";
import Timer from "./components/Timer";
import { requirePomodoroContext } from "./util";
import clsx from "clsx";
import Spinner from "./components/Spinner";
import Mute from "./components/icons/Mute";

const Pomodoro: React.FC = () => {
  const p = requirePomodoroContext();
  // On mount, set up DeskThing listener for data from the server
  useEffect(() => {
    const onAppData = async (_: SocketData) => {};

    const removeListener = DeskThing.on("data", onAppData);
    return () => {
      removeListener();
    };
  }, []);

  const mainClass =
    "fixed bg-gradient-to-r w-screen h-screen flex flex-col justify-center items-center font-sans transition-all duration-500";

  return (
    <>
      <div
        className={clsx(
          p.settings ? "opacity-0" : "opacity-100",
          "from-black to-gray-600",
          mainClass
        )}
      >
        <Spinner />
      </div>
      <div
        className={clsx(
          p.settings ? "opacity-100" : "opacity-0",
          "from-theme-a to-theme-b",
          mainClass
        )}
      >
        {!p.settings?.audioEnabled && (
          <div className="absolute bottom-0 right-0 p-6">
            <Mute className="size-12 text-white" />
          </div>
        )}
        <SessionOverview />
        <div className="h-9" />
        <Timer />
        <div className="h-6" />
        <Controls />
      </div>
    </>
  );
};

export default Pomodoro;
