
function removeImage() {
  if (uploadedImage) {
    uploadedImage.remove();
    uploadedImage = undefined;
  }
  const rmvElt = document.getElementById("remove-button");
  rmvElt.style.visibility = "hidden";
}

export let uploadedImage = null

export const imageUploadComponent =(
  name,
  holder,
  callback = (file) => {
    if (file.type === "image") {
      uploadedImage = p5.createImg(file.data, "");
      uploadedImage.hide();
      // globalContext.uploadedImage = holder
      const elt = document.getElementById("remove-button");
      elt.style.visibility = "visible";
      elt.onclick = removeImage;
    } else {
      uploadedImage = null;
    }
  }
) => {
  const elt = document.getElementById("gui");
  if (!gui[name]) {
    const container = p5.createDiv();
    container.addClass("gui-item");
    container.addClass("button");
    const title = p5.createP(name);
    title.addClass("gui-item-title");
    title.parent(container);
    const dom = p5.createFileInput(callback);
    dom.addClass("button-elt");
    dom.addClass("upload-button-elt");
    dom.style("width", "50%");
    const rmv = p5.createButton("remove");
    rmv.id("remove-button");
    rmv.style("visibility", "hidden");
    rmv.addClass('"button-elt"');
    dom.parent(container);
    rmv.parent(container);
    container.parent(elt);
    gui[name] = dom;
  } else {
    throw new Error(
      "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
    );
  }
};
