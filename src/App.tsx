import React from "react";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import Pomodoro from "./Pomodoro";

const App: React.FC = () => {
  return (
    <PomodoroProvider>
      <Pomodoro />
    </PomodoroProvider>
  );
};

export default App;
