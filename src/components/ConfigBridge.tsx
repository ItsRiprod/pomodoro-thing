import { DeskThing } from "deskthing-client";

export default function ConfigBridge() {
  const setCssProperty = (property: string, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(property, value);
  };

  DeskThing.on("colorA", (data) => {
    console.log("color A", +data.payload);
    setCssProperty("--themeA", data.payload);
  });

  DeskThing.on("colorB", (data) => {
    console.log("color B", +data.payload);
    setCssProperty("--themeB", data.payload);
  });

  return <></>;
}
