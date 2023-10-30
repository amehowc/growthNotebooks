export const creditsComponent = (name = "google", link = "www.google.com") => {
  const elt = document.getElementById("gui");
  if (!gui[name]) {
  const container = p5.createDiv();
  container.addClass("gui-credits");
  container.id("credits");
  const linkedcredits =
    "credits: " +
    "<a href='arthurcloche.com'target='_blank'>Arthur Cloche</a> & ";
  const innerhtml =
    linkedcredits + "<a href='" + link + "'target='_blank'>" + name + "</a>";
  const title = p5.createP(innerhtml);
  title.addClass("gui-credits-title");
  title.parent(container);
  container.parent(elt);
  gui[name] = dom;
} else {
  throw new Error(
    "Already a GUI item with this name. Use console.log(gui) to figure out what's wrong"
  );
}
};