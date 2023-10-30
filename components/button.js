/*
button("button",'hello',()=>{console.log('hey')});
*/

export const buttonComponent = (
    name,
    innerText = "Press Me",
    callback = () => {
      console.log(name + " is pressed");
    }
  ) => {
    const elt = document.getElementById("gui");
    if (!gui[name]) {
      const container = p5.createDiv();
      container.addClass("gui-item");
      container.addClass("button");
      const title = p5.createP(name);
      title.addClass("gui-item-title");
      const dom = p5.createButton(innerText).mousePressed(callback);
      dom.addClass("button-elt");
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