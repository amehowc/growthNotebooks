import { sliderComponent } from "./components/slider.js";
import { slidersComponent } from "./components/sliders.js";
import { buttonComponent } from "./components/button.js";
import { buttonsComponent } from "./components/buttons.js";
import { dropdownComponent } from "./components/dropdown.js";
import { colorpickerComponent } from "./components/colorpicker.js";
import { textareaComponent } from "./components/textarea.js";
import { creditsComponent } from "./components/credits.js";
import { paragraphComponent } from "./components/paragraph.js";
import { imageUploadComponent } from "./components/imageUpload.js";
import { checkboxComponent } from "./components/checkbox.js";

export const gui = {};
export const slider = sliderComponent;
export const sliders = slidersComponent;
export const button = buttonComponent;
export const buttons = buttonsComponent;
export const dropdown = dropdownComponent;
export const colorpicker = colorpickerComponent;
export const textarea = textareaComponent;
export const credits = creditsComponent;
export const paragraph = paragraphComponent;
export const imageUpload = imageUploadComponent;
export const checkbox = checkboxComponent

export const initializeGUI = (sketch, name = "Controls") => {
  const elt = p5.createDiv();
  elt.addClass("gui-container");
  elt.id("gui");
  const container = p5.createDiv('Growth v 0.0');
  container.addClass("gui-item");
  const pTitle = p5.createP(name);
  pTitle.addClass("title");
  pTitle.parent(container);
  container.parent(elt);
  const canvas = document.getElementById("canvas-container");
  // const dom = p5.createButton("Hide Controls");
  // dom.mousePressed(() => {
  //   const elt = document.getElementById("gui");
  //   const btn = document.getElementById("show-controls-button");
  //   if (window.getComputedStyle(elt).display === "flex") {
  //     elt.style.display = "none";
  //     dom.innerhtml = "Show Controls";
  //   } else {
  //     elt.style.display = "flex";
  //     dom.innerhtml = "Show Controls";
  //   }
  // });
  // dom.id("show-controls-button");
  // dom.addClass("button-elt");
  // dom.parent(canvas);
};
