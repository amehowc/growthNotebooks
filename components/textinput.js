/*
textinput('textarea-name','')
*/

export const textinputComponent = (name, settings = "hello world!") => {
      const elt = document.getElementById("gui");
      if (!gui[name]) {
        const container = p5.createDiv();
        container.addClass("gui-item");
        container.addClass("textinput");
        const title = p5.createP(name);
        title.addClass("gui-item-title");
        title.parent(container);
        const dom = p5.createInput(settings);
        dom.addClass("textinput-elt");
        dom.parent(container);
        container.parent(elt);
        gui[name] = dom;
      } else {
        throw new Error(
          "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
        );
      }
    };