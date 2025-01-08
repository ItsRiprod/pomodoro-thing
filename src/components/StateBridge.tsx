import { DeskThing } from "deskthing-client";
import { requirePomodoroContext } from "../util";
import { useEffect, useState } from "react";

export default function StateBridge() {
  const [data, setData] = useState<any>(null);
  const p = requirePomodoroContext();

  const syncStateToServer = async () => {
    const stateData = { test: "test", timeLeftSec: p.timeLeftSec };
    DeskThing.send({
      type: "timerState",
      payload: stateData,
    });
    setData(JSON.stringify(stateData, undefined, 2));
  };

  // Sync timer state to server every second
  // useEffect(() => {
  //   const sync = setInterval(() => {
  //     syncStateToServer();
  //   }, 1000);

  //   return () => {
  //     clearInterval(sync);
  //   };
  // }, [p]);

  // TODO: remove
  return (
    // <div className="min-h-[100px] bg-white text-black ">
    //   <pre>
    //     <code>{data}</code>
    //   </pre>
    // </div>
    <></>
  );
}
