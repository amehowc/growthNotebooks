import * as dom from "./gui.js";
import { scaleTo } from "./helpers.js";

import VertexType from "./differentialGrowth/vertexType.js";
import GrowingShapes from "./differentialGrowth/differentialGrowth.js";

//const c = document.getElementById("canvas");
const container = document.getElementById("canvas-container");

const maxExports = 100;
let actualNumExports = 0;

const makeUI = () => {
	dom.initializeGUI();
	dom.textarea("text-input", { default: "Bah" }, () => {
		p5.resetSimulation();
	});
	dom.sliders("text", [
		{
			name: "size",
			settings: [1, 5, 3, 0.001],
			callback: () => {
				p5.resetSimulation();
			},
		},
		{
			name: "details",
			settings: [0.2, 1, 0.5, 0.001],
			callback: () => {
				p5.resetSimulation();
			},
		},
	]);
	dom.checkbox("continuous-generate", "Continuous Generation", true, () => {
		//resetSimulation();
	});
	dom.checkbox("generate-all", "Generate in all shapes", false, () => {
		//resetSimulation();
	});
	dom.sliders("generation", [
		{
			name: "count",
			settings: [1, 10, 1, 1],
			callback: () => {},
		},
	]);
	dom.sliders("curve", [
		{
			name: "springs",
			settings: [0, 1, 0.8, 0.001],
			callback: () => {},
		},
		{
			name: "speed",
			settings: [0, 1, 0.35, 0.001],
			callback: () => {},
		},
		{
			name: "repulsion",
			settings: [0, 2, 1, 0.01],
			callback: () => {},
		},
		{
			name: "radius",
			settings: [10, 50, 25, 0.01],
			callback: () => {},
		},
		{
			name: "damping",
			settings: [0, 10, 1, 0.01],
			callback: () => {},
		},
		{
			name: "drag",
			settings: [0, 1, 0.8, 0.01],
			callback: () => {},
		},
		{
			name: "friction",
			settings: [0, 1, 1, 0.01],
			callback: () => {},
		},
		// {
		// 	name: "friction",
		// 	settings: [0, 10, 1, 0.01],
		// 	callback: () => {},
		// },
	]);

	dom.sliders("container", [
		{
			name: "width",
			settings: [0, 1, 0.1, 0.001],
			callback: () => {},
		},
		{
			name: "height",
			settings: [0, 1, 0.1, 0.001],
			callback: () => {},
		},
	]);
	dom.button("reset", "Reset", () => {
		p5.resetSimulation();
	});
	dom.button("export", "Export SVG", () => {
		p5.save("growth-type");
	});
	dom.checkbox("continuous-export", "Continuous Export", false, () => {
		//resetSimulation();
		console.log(`Exported :${actualNumExports} of ${maxExports}`);
	});
	dom.checkbox(
		"continuous-export-reset",
		"Continuous Export + Reset",
		false,
		() => {
			p5.resetSimulation();
			console.log(`Exported :${actualNumExports} of ${maxExports}`);
		}
	);
};

const sketch = (p5) => {
	const margins = 40;
	const canvasRatio = { width: 960, height: 640 };
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

	const createLetterOutline = (source) => {
		if (letters.length === 0) {
			console.log("changed");
			const details = gui["text-details"].value();
			vertexType.details = details;
			vertexType.make(source).createOutlines();
			bufferedWord = source;
			growingShapes = new GrowingShapes(p5);
			vertexType.outlines.forEach((outlines, group) => {
				const { letter, shapes } = outlines;
				growingShapes.addShapes({ letter, shapes, group });
			});
		}
	};

	p5.resetSimulation = () => {
		const txt = gui["text-input"].value();
		createLetterOutline(txt);
	};

	p5.setup = () => {
		const canvasWidth = Math.floor(canvasRatio.width * 1);
		const canvasHeight = Math.floor(canvasRatio.height * 1);

		p5.createCanvas(canvasWidth, canvasHeight, p5.SVG);
		const container = document.getElementById("canvas-container");
		const canvas = document.getElementById("defaultCanvas0");
		canvas.style.borderStyle = "solid";
		container.appendChild(canvas);

		p5.frameRate(24);
		vertexType = new VertexType(p5, font);
		growingShapes = new GrowingShapes(p5);
		makeUI();
		const txt = gui["text-input"].value();
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
		p5.clear();

		p5.translate(p5.width / 2, p5.height / 2);

		const speed = gui["curve-speed"].value();
		const generateAll = gui["generate-all"].checked();
		const continuous = gui["continuous-generate"].checked();
		const numToAdd = gui["generation-count"].value();
		const useMouse = p5.mouseIsPressed && mouseIsOverCanvas();
		const tick = p5.frameCount % 10 === 0;
		const isDone = growingShapes.world.length >= 3000;

		const generate =(_shape)=>{
			if (generateAll) {
				for (let shape of growingShapes.shapes) {
					for (let i = 0; i <= numToAdd; i++) {
						shape.insertPoint(
							false,
							5,
							5,
							Math.floor(p5.random(shape.points.length - 2))
						);
					}
				}
			} else {
				
				for (let i = 0; i < numToAdd; i++) {
					_shape.insertPoint(
						false,
						5,
						5,
						Math.floor(p5.random(_shape.points.length - 2))
					);
				}
			}
		}
		let shape = undefined
		if (useMouse && !isDone) {
			if(!shape){shape = p5.random(growingShapes.shapes);}
			console.log(shape)
			generate(shape)
		} else if (continuous && !isDone && tick && !useMouse) {
			generate()
		}

		p5.push();
		if (!!growingShapes.world.length < 3000) {
			growingShapes.update(speed);
		}

		p5.fill(0);
		growingShapes.display();
		p5.pop();
		if (
			(gui["continuous-export"].checked() ||
				gui["continuous-export-reset"].checked()) &&
			actualNumExports < maxExports &&
			p5.frameCount > 10 &&
			p5.frameCount % 10 === 0
		) {
			p5.save();
			actualNumExports++;
		}
	};

	// p5.windowResized = () => {
	// 	const scalefactor = scaleTo(
	// 		canvasRatio.width,
	// 		canvasRatio.height,
	// 		container.clientWidth - margins * 2,
	// 		container.clientHeight - margins * 2
	// 	);
	// 	const canvasWidth = Math.floor(canvasRatio.width * scalefactor);
	// 	const canvasHeight = Math.floor(canvasRatio.height * scalefactor);
	// 	p5.resizeCanvas(canvasWidth, canvasHeight);
	// 	p5.clear()
	// };
};
p5 = new p5(sketch);
