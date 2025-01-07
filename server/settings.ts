import { DeskThing, DataInterface, SettingsType } from "deskthing-server";

export const setupSettings = async (Data: DataInterface | null) => {
  const requiredSettings = [
    // "image",
    // "number",
    // "boolean",
    // "string",
    // "select",
    // "multiselect",
    // "list",
    // "ranked",
    // "range",
    "colorA",
  ];

  // This checks if there are any settings missing
  const hasAllSettings = requiredSettings.every(
    (setting) => Data?.settings?.[setting]
  );

  // If any of the settings are missing, then add them
  if (!hasAllSettings) {
    // Defined the settings object. SettingsType is an interface of any setting type. This sets up the key-value pair of settings

    const Settings: { [key: string]: SettingsType } = {
      // image: {
      //   label: "Image URL",
      //   description: "Enter the URL or filepath to an image",
      //   type: "string",
      //   value: '',
      // },
      // number: {
      //   label: "Number Input",
      //   description: "Choose a number between 0 and 100",
      //   type: "number",
      //   value: 0,
      //   min: 0,
      //   max: 100,
      // },
      // boolean: {
      //   label: "Toggle Switch",
      //   description: "Switch between true and false",
      //   type: "boolean",
      //   value: false,
      // },
      // string: {
      //   label: "Text Input",
      //   description: "Enter any text value",
      //   type: "string",
      //   value: "",
      // },
      // select: {
      //   label: "Theme Selector",
      //   description: "Choose between dark and light themes",
      //   type: "select",
      //   value: "dark",
      //   options: [
      //     { label: "Dark Theme", value: "dark" },
      //     { label: "Light Theme", value: "light" },
      //   ],
      // },
      // multiselect: {
      //   label: "Multiple Options",
      //   description: "Select one or more options from the list",
      //   type: "multiselect",
      //   value: ["option1", "option2"],
      //   options: [
      //     { label: "Option1", value: "option1" },
      //     { label: "Option2", value: "option2" },
      //     { label: "Option3", value: "option3" },
      //     { label: "Option4", value: "option4" },
      //   ],
      // },
      // list: {
      //   label: "Settings List",
      //   description: "Select multiple items from the list",
      //   type: "list",
      //   value: ["item1", "item2"],
      //   options: [
      //     { label: "Item1", value: "item1" },
      //     { label: "Item2", value: "item2" },
      //     { label: "Item3", value: "item3" },
      //     { label: "Item4", value: "item4" },
      //   ],
      // },
      // ranked: {
      //   label: "Ranked Options",
      //   description: "Rank the options from best to worst",
      //   type: "ranked",
      //   value: ["option1", "option2"],
      //   options: [
      //     { label: "Option1", value: "option1" },
      //     { label: "Option2", value: "option2" },
      //     { label: "Option3", value: "option3" },
      //     { label: "Option4", value: "option4" },
      //   ],
      // },
      // range: {
      //   label: "Range Slider",
      //   description: "Adjust the value using the slider",
      //   type: "range",
      //   value: 50,
      //   min: 0,
      //   max: 100,
      // },
      colorA: {
        label: "Color A",
        description: "Background Color A (Left)",
        type: "color",
        value: "#2dd4bf",
      },
      colorB: {
        label: "Color B",
        description: "Background Color B (Right)",
        type: "color",
        value: "#fef08a",
      },
    };

    // This adds the settings to the server. When the user changes a setting, the 'data' callback is triggered
    DeskThing.addSettings(Settings);
  }
};
