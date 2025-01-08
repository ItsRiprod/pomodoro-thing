import React from "react";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import Pomodoro from "./Pomodoro";
import SettingsBridge from "./components/SettingsBridge";
import StateBridge from "./components/StateBridge";

const App: React.FC = () => {
  return (
    <PomodoroProvider>
      <SettingsBridge />
      <StateBridge />
      <Pomodoro />
    </PomodoroProvider>
  );
};

export default App;
