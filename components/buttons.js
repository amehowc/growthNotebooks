/*
buttons('button-group-name',buttonGroup=[
    {
      name: "button-name",
      innerText:'label',
      callback: () => {
        console.log(buttonGroup[0].name + " has been changed");
      },
    }],
*/


export const buttonsComponent = (
  nameGroup,
  buttonGroup = [
    {
      name: "play",
      innerText: "⏵︎",
      callback: () => {
        console.log(buttonGroup[0].innerText + " is pressed");
      },
    },
    {
      name: "pause",
      innerText: "⏸︎",
      callback: () => {
        console.log(buttonGroup[1].innerText + " is pressed");
      },
    },
    {
      name: "reset",
      innerText: "⏮︎",
      callback: () => {
        console.log(buttonGroup[2].innerText + " is pressed");
      },
    },
    {
      name: "save",
      innerText: "Save",
      callback: () => {
        console.log(buttonGroup[3].innerText + " is pressed");
      },
    },
  ]
) => {
  const elt = document.getElementById("gui");
  if (!gui[name]) {
    const container = p5.createDiv();
    container.addClass("gui-item");
    container.addClass("buttons");
    const title = p5.createP(nameGroup);
    title.parent(container);
    title.addClass("gui-item-title");
    buttonGroup.forEach((settings, id) => {
      const { name, innerText, callback } = settings;
      const dom = p5.createButton(innerText).mousePressed(callback);
      dom.addClass("button-elt");
      dom.parent(container);

      gui[nameGroup + "-" + name] = dom;
    });
    container.parent(elt);
  } else {
    throw new Error(
      "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
    );
  }
};
