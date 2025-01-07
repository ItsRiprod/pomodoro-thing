import React from "react";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import Pomodoro from "./Pomodoro";
import ConfigBridge from "./components/ConfigBridge";

const App: React.FC = () => {
  return (
    <PomodoroProvider>
      <ConfigBridge />
      <Pomodoro />
    </PomodoroProvider>
  );
};

export default App;
