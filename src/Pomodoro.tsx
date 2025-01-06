import React, { useEffect } from "react";
import { DeskThing, SocketData } from "deskthing-client";
import SessionOverview from "./components/SessionOverview";
import Controls from "./components/Controls";
import Timer from "./components/Timer";

const Pomodoro: React.FC = () => {
  // On mount, set up DeskThing listener for data from the server
  useEffect(() => {
    const onAppData = async (data: SocketData) => {
      console.log("Received data from the server!");
      console.log(data.payload);
    };

    const removeListener = DeskThing.on("data", onAppData);
    return () => {
      removeListener();
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-theme-a to-theme-b w-screen h-screen flex justify-center items-center flex-col space-y-2.5 font-sans">
      <SessionOverview />
      <Timer />
      <Controls />
    </div>
  );
};

export default Pomodoro;
