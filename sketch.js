import * as dom from "./gui.js";
import { scaleTo } from "./helpers.js";

import VertexType from "./differentialGrowth/vertexType.js";
import GrowingShapes from "./differentialGrowth/differentialGrowth.js";

const c = document.getElementById("canvas");
const container = document.getElementById("canvas-container");

const maxExports = 100;
let actualNumExports = 0;

const sketch = (p5) => {
	const margins = 40;
	const canvasRatio = { width: 1200, height: 640 };
	let font;
	let vertexType;
	let growingShapes;
	let globalStepTime = 0.55;

	//console.log(this)
	let letters = [];
	let bufferedWord = "";
	p5.preload = () => {
		font = p5.loadFont("src/AtlasGrotesk-Bold.otf");
	};

	const mouseIsOverCanvas = () => {
		const mx = p5.mouseX;
		const my = p5.mouseY;
		return mx > 0 && mx < p5.width && my > 0 && p5.height;
	};

	function generateSVG(groupedShapes) {
		let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${p5.width}" height="${p5.height}">`;

		for (let group in groupedShapes) {
			let groupShapes = groupedShapes[group];
			svgContent += "<g>";

			// First, add the first shape of the group (if it exists)
			if (groupShapes.length > 0) {
				const color = `rgb(0,0,0)`;
				svgContent += `<path d="${pointsToPath(
					groupShapes[0].points
				)}" fill="${color}" />`;
			}

			// Then, add any contour shapes
			groupShapes.slice(1).forEach((shape) => {
				const color = getRandomColor();
				svgContent += `<path d="${pointsToPath(shape.points)}" fill="${color}" />`;
			});

			svgContent += "</g>";
		}

		svgContent += "</svg>";
		return svgContent;
	}

	function getRandomColor() {
		// Generate a random RGB color
		const r = Math.floor(Math.random() * 256);
		const g = Math.floor(Math.random() * 256);
		const b = Math.floor(Math.random() * 256);
		return `rgb(${r},${g},${b})`;
	}

	function pointsToPath(points) {
		// Not enough points for a Bezier curve; fall back to straight lines
		return (
			points
				.map(
					(p, i) =>
						`${i === 0 ? "M" : "L"} ${p.pos.x + p5.width / 2} ${
							p.pos.y + p5.height / 2
						}`
				)
				.join(" ") + " Z"
		);
	}

	// function pointsToPath(points) {
	// 	if (points.length < 3) {
	// 		// Not enough points for a Bezier curve; fall back to straight lines
	// 		return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.pos.x + p5.width/2} ${p.pos.y + p5.height/2}`).join(' ') + ' Z';
	// 	}

	// 	let path = `M ${points[0].pos.x + p5.width/2} ${points[0].pos.y + p5.height/2} `; // Start at the first point

	// 	// Add a Bezier curve between each point
	// 	for (let i = 1; i < points.length - 1; i++) {
	// 		const cp1x = (points[i].pos.x + points[i - 1].pos.x) / 2 + p5.width/2;
	// 		const cp1y = (points[i].pos.y + points[i - 1].pos.y) / 2 + p5.height/2;
	// 		const cp2x = (points[i].pos.x + points[i + 1].pos.x) / 2 + p5.width/2;
	// 		const cp2y = (points[i].pos.y + points[i + 1].pos.y) / 2 + p5.height/2;

	// 		path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].pos.x + p5.width/2} ${points[i].pos.y + p5.height/2} `;
	// 	}

	// 	// Curve through the last point
	// 	let last = points.length - 1;
	// 	const cp1x = (points[last].pos.x + points[last - 1].pos.x) / 2 + p5.width/2;
	// 	const cp1y = (points[last].pos.y + points[last - 1].pos.y) / 2 + p5.height/2;
	// 	path += `C ${cp1x} ${cp1y}, ${points[last].pos.x + p5.width/2} ${points[last].pos.y + p5.height/2}, ${points[last].pos.x + p5.width/2} ${points[last].pos.y + p5.height/2}`;

	// 	return path + 'Z';
	// }

	function exportSVG() {
		const shapes = growingShapes.shapes ? growingShapes.shapes : [];
		const groups = groupShapes(shapes);
		const svgData = generateSVG(groups);

		let blob = new Blob([svgData], { type: "image/svg+xml" });
		let url = URL.createObjectURL(blob);

		let a = document.createElement("a");
		a.href = url;
		a.download = "shapes.svg";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	}

	function groupShapes(shapes) {
		let groupedShapes = {};
		// Group shapes by their group number
		shapes.forEach((shape) => {
			if (!groupedShapes[shape.group]) {
				groupedShapes[shape.group] = [];
			}
			groupedShapes[shape.group].push(shape);
		});
		return groupedShapes;
	}

	const createLetterOutline = (source) => {
		if (letters.length === 0 || source !== bufferedWord) {
			console.log("changed");
			vertexType.make(source).createOutlines();
			bufferedWord = source;
			growingShapes = new GrowingShapes(p5);
			vertexType.outlines.forEach((outlines, group) => {
				const { letter, shapes } = outlines;
				growingShapes.addShapes({ letter, shapes, group });
			});
		}
	};

	const resetSimulation = () => {
		const txt = gui["text-area"].value();
		createLetterOutline(txt);
	};

	p5.setup = () => {
		const scalefactor = scaleTo(
			canvasRatio.width,
			canvasRatio.height,
			container.clientWidth - margins * 2,
			container.clientHeight - margins * 2
		);
		const canvasWidth = Math.floor(canvasRatio.width * scalefactor);
		const canvasHeight = Math.floor(canvasRatio.height * scalefactor);

		p5.createCanvas(canvasWidth, canvasHeight, p5.WEBGL, c);
		p5.frameRate(24);
		vertexType = new VertexType(p5, font);
		growingShapes = new GrowingShapes(p5);
		dom.initializeGUI();
		dom.textarea("text-area", { default: "Bah" }, () => {
			resetSimulation();
		});
		dom.slider("text-size", [0, 1, 0.5, 0.001]);
		dom.button("reset-button", "Reset", () => {
			resetSimulation();
		});
		dom.button("export-svg-button", "Export SVG", () => {
			exportSVG();
		});
		dom.checkbox("continuous-export", "Continuous Export", false, () => {
			resetSimulation();
		});
		const txt = gui["text-area"].value();
		createLetterOutline(txt);
		//console.log(vertexType);

		// let shape = [];
		// let r = 100;
		// for (var a = 0; a < p5.TAU; a += p5.TAU / 10) {
		// 	const x = r * Math.cos(a);
		// 	const y = r * Math.sin(a);
		// 	shape.push({ x: x, y: y });
		// }
		// growingShapes.addShape(shape);

		// shape = [];
		// r = 50;
		// for (var a = p5.TAU; a > 0; a -= p5.TAU / 10) {

		// 	const x = r * Math.cos(a);
		// 	const y = r * Math.sin(a);
		// 	shape.push({ x: x, y: y });
		// }
		// growingShapes.addShape(shape);
	};

	p5.draw = () => {
		p5.background("antiquewhite");
		//p5.translate(p5.width / 2, p5.height / 2);
		const txt = gui["text-area"].value();

		if (
			((p5.mouseIsPressed && mouseIsOverCanvas()) || p5.frameCount % 10 === 0) &&
			growingShapes.world.length < 3000 && p5.frameCount > 10
		) {
			if (gui["continuous-export"].checked() && actualNumExports < maxExports) {
				exportSVG();
				actualNumExports++;
			}
			growingShapes.shapes.forEach((shape) => {
				shape.insertPoint(
					false,
					5,
					5,
					Math.floor(p5.random(shape.points.length - 2))
				);
			});

			
		}

		p5.push();
		if (growingShapes.world.length < 3000) {
			growingShapes.update(globalStepTime);
		}

		//console.log(growingShapes.shapes)
		// p5.scale(3)
		//p5.noFill(0)
		p5.fill(0);
		// p5.stroke(0)
		// p5.strokeWeight(4)
		growingShapes.display();
		p5.pop();

		//p5.noLoop()
	};

	p5.windowResized = () => {
		const scalefactor = scaleTo(
			canvasRatio.width,
			canvasRatio.height,
			container.clientWidth - margins * 2,
			container.clientHeight - margins * 2
		);
		const canvasWidth = Math.floor(canvasRatio.width * scalefactor);
		const canvasHeight = Math.floor(canvasRatio.height * scalefactor);
		p5.resizeCanvas(canvasWidth, canvasHeight);
	};
};
p5 = new p5(sketch);
