/*
dropdown('dropdown-name',['A','B','C',],()=>{})
*/


export const dropdownComponent = (
    name,
    settings = ["A", "B", "C", "D"],
    callback = () => {
      console.log(name + " is changed");
    }
  ) => {
    const elt = document.getElementById("gui");
    if (!gui[name]) {
      const container = p5.createDiv();
      container.addClass("gui-item");
      container.addClass("dropdown");
      const title = p5.createP(name);
      title.addClass("gui-item-title");
      const dom = p5.createSelect();
      dom.style("min-width", "55%");
      settings.forEach((option) => {
        if (typeof option === "string") {
          dom.option(option);
        } else {
          console.log(`The option ${option} has to be a string`);
        }
        dom.selected(settings[0]);
      });
      dom.addClass("dropdown-elt");
      title.parent(container);
      dom.parent(container);
      container.parent(elt);
      gui[name] = dom;
    } else {
      throw new Error(
        "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
      );
    }
  };
