/*
colorpicker('colopicker',[''])
*/

export const colorpickerComponent = (name, settings = ["#FFF","#000"]) => {
  const elt = document.getElementById("gui");
  if (!gui[name]) {
    const container = p5.createDiv();
    container.addClass("gui-item");
    container.addClass("colorpicker");
    const title = p5.createP(name);
    title.addClass("gui-item-title");
    title.parent(container);
    settings.forEach((setting, id) => {
      const dom = p5.createColorPicker(setting);
      dom.addClass("colorpicker-elt");
      dom.parent(container);
      gui[name +'-'+ `${id}`] = dom;
    });
    container.parent(elt);
  } else {
    throw new Error(
      "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
    );
  }
};