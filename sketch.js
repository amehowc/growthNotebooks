import * as dom from "./gui.js";
import { scaleTo } from "./helpers.js";

import VertexType from "./differentialGrowth/vertexType.js";
import GrowingShapes from "./differentialGrowth/differentialGrowth.js";

const c = document.getElementById("canvas");
const container = document.getElementById("canvas-container");

const sketch = (p5) => {
	const margins = 40;
	const canvasRatio = { width: 360, height: 640 };
	let font;
	let vertexType;
	let growingShapes;
	let globalStepTime = 0.15;

	//console.log(this)
	let letters = [];
	let bufferedWord = "";
	p5.preload = () => {
		font = p5.loadFont("src/AtlasGrotesk-Bold.otf");
	};

	const createLetterOutline = (source) => {
		if (letters.length === 0 || source !== bufferedWord) {
			console.log("changed");
			vertexType.make(source).createOutlines();
			bufferedWord = source;
		}
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

		p5.createCanvas(canvasWidth, canvasHeight, p5.P2D, c);

		vertexType = new VertexType(p5, font);
		growingShapes = new GrowingShapes(p5);
		dom.initializeGUI();
		dom.textarea("text-area", { default: "Ah!" }, () => {
			const txt = gui["text-area"].value();
			createLetterOutline(txt);
		});
		dom.slider("text-size", [0, 1, 0.5, 0.001]);
		const txt = gui["text-area"].value();
		createLetterOutline(txt);
		console.log(vertexType);

		vertexType.outlines.forEach((letter) => {
			const { txt, shapes } = letter;

			shapes.forEach((shape) => {
				growingShapes.addShape(
					shape.map((pt) => {
						return {
							x: pt.x,
							y: pt.y,
						};
					})
				);
			});
		});

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
		p5.background("blue");
		p5.translate(p5.width / 2, p5.height / 2);
		const txt = gui["text-area"].value();

		if (
			(p5.mouseIsPressed || p5.frameCount % 10 === 0) &&
			growingShapes.world.length < 3000
		) {
			growingShapes.shapes.forEach((shape) => {
				shape.insertPoint(
					false,
					5,
					5,
					Math.floor(p5.random(shape.points.length - 2))
				);

				shape.insertPoint(
					false,
					5,
					5,
					Math.floor(p5.random(shape.points.length - 2))
				);

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
		growingShapes.display();
		p5.pop();
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
