/*
sliders('slider-group-name',[
    {
      name: "slider-name",
      settings: [0, 1, 0.5, 0.001],
      callback: () => {
        console.log(sliderGroup[0].name + " has been changed");
      },
    }],
*/


export const slidersComponent = (
  nameGroup,
  sliderGroup = [
    {
      name: "x",
      settings: [0, 1, 0.5, 0.001],
      callback: () => {
        console.log(sliderGroup[0].name + " has been changed");
      },
    },
    {
      name: "y",
      settings: [0, 1, 0.5, 0.001],
      callback: () => {
        console.log(sliderGroup[1].name + " has been changed");
      },
    },
    {
      name: "z",
      settings: [0, 1, 0.5, 0.001],
      callback: () => {
        console.log(sliderGroup[2].name + " has been changed");
      },
    },
  ]
) => {
  const elt = document.getElementById("gui");
  if (!gui[nameGroup]) {
    const container = p5.createDiv();
    container.addClass("gui-item");
    container.addClass("sliders");
    const title = p5.createP(nameGroup);
    title.addClass("gui-item-title");
    title.parent(container);
    sliderGroup.forEach((setting, id) => {
      const { name, settings, callback } = setting;
      const title = p5.createP(name);
      title.addClass("gui-item-title");
      const dom = p5.createSlider(...settings);
      dom.addClass("slider-elt");
      dom.style("width", "100%");
      dom.parent(title);
      title.parent(container);
      if (callback) {
        dom.changed(callback);
      }
      gui[nameGroup + "-" + name] = dom;
    });
    container.parent(elt);
  } else {
    throw new Error(
      "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
    );
  }
};
