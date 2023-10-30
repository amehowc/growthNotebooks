/*
slider('slider-name',[min,max,start,step],()=>{})
*/

export const sliderComponent = (
  name,
  settings = [0, 1, 0.5, 0.001],
  callback = () => {
    console.log(name + " has been changed");
  }
) => {
  const elt = document.getElementById("gui");
  if (!gui[name]) {
    const container = p5.createDiv();
    container.addClass("gui-item");
    container.addClass("slider");
    const title = p5.createP(name);
    title.addClass("gui-item-title");
    title.parent(container);
    const dom = p5.createSlider(...settings).changed(callback);
    dom.addClass("slider-elt");
    dom.style("width", "100%");
    dom.parent(title);
    container.parent(elt);
    // if (callback) {
    //   if (callbacks.length) {
    //     callbacks.forEach((callback) => {
    //       const { event, func } = callback;
    //       dom[event](func);
    //     });
    //   } else {
    //     const { event, func } = callbacks;
    //     dom[event](func);
    //   }
    // }
    gui[name] = dom;
  } else {
    throw new Error(
      "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
    );
  }
};
