import React from "react";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import Pomodoro from "./Pomodoro";
import DeskThingBridge from "./components/DeskThingBridge";

const App: React.FC = () => {
  return (
    <PomodoroProvider>
      <DeskThingBridge />
      <Pomodoro />
    </PomodoroProvider>
  );
};

export default App;
