/*
paragraph(name,'')
*/

export const paragraphComponent = (name, innerText = "Hello there !") => {
  const elt = document.getElementById("gui");
  if (!gui[name]) {
    const container = p5.createDiv();
    container.addClass("gui-item");
    container.addClass("paragraph");
    const title = p5.createP(name);
    title.addClass("gui-item-title");
    title.parent(container);
    const dom = p5.createP(innerText);
    dom.addClass("p-elt");
    dom.parent(title);
    container.parent(elt);
    gui[name] = dom;
  } else {
    throw new Error(
      "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
    );
  }
};
