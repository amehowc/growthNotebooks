import { calculateArea } from "../helpers.js";

export default function VertexType(
	p5,
	font,
	options = {
		details: 0.15,
		minDist: 10,
		leading: 0,
		kerning: 0,
		reverseGroupsDirections: false,
		flattenOutput: true,
	}
) {
	this.details = Math.max(options.details, 0.6);
	this.minDist = Math.max(options.minDist, 10.0);
	this.font = font;
	this.p5 = p5;
	this.defaultSize = 100;
	this.leading = Math.min(options.leading, 0.0);
	this.kerning = Math.min(options.kerning, 0.0);
	// TO DO : word spacing
	this.blockBounds = undefined;
	this.reverseGroupsDirections = options.reverseGroupsDirections || false;
	this.flattenOutput = options.flattenOutput || true;
	this.lineBounds = [];
	this.actualText = "";

	this.make = (text = "A") => {
		if (text !== this.actualText) {
			this.actualText = text;
			this.characters = this.flatten(this.getCharactersPoints(this.actualText));
			this.lineBounds = this.computeBounds(this.lineBounds);
			this.outlines = this.createOutlines();
		}
		return this;
	};

	this.createOutlines = () => {
		const { lineHeight, lineWidths, blockWidth } = this.lineBounds;
		let advance = 0;
		let whichLine = 0;
		const numLines = lineWidths.length;
		
		const outlines = this.characters.map((letter, letterIndex) => {
			const { line, groups, bounds, value } = letter;
			if (line > whichLine) {
				advance = 0;
				whichLine = line;
			}
			const lineWidth = lineWidths[line];
			
			const shapes = groups.map((points, groupIndex) => {
				const shape = points.map((p, i) => {
					const cx = advance - lineWidth / 2;
					const cy =
						lineHeight / 4 +
						(line - (numLines - 1) / 2) * (lineHeight + this.leading);
					return { x: p.x + cx, y: p.y + cy };
				});
				
				return shape;
			});
			advance += bounds.w + bounds.advance;
			return { letter: value, shapes };
		});
		return outlines;
	};

	this.draw = () => {};

	this.computeBounds = (bounds) => {
		const widths = bounds.map((line) => line.w);
		const blockWidth = Math.max(...widths);
		const tallestLine = Math.max(...bounds.map((line) => line.h));
		return {
			lineHeight: tallestLine,
			lineWidths: widths,
			blockWidth: blockWidth,
		};
	};

	this.getCharactersPoints = (text, ft = this.font) => {
		// much faster on the 2D context in case of webgl
		const pg = this.p5.createGraphics(1, 1);
		this.lineBounds = [];

		// text is split in lines/words/characters,... down to points using the built-in functions. The points are then broken down in groups using a dist() to figure out if the next point is far enough to be considered belonging to an another shape.
		const positions = text.split("\n").map((line, lineIndex) => {
			let advance = 0;
			this.lineBounds.push(this.font.textBounds(line, 0, 0, 100));
			return line.split(/(\s+)/).map((word, wordIndex) => {
				return word.split("").map((char, charIndex) => {
					const charWidth = pg.textWidth(char);
					const options = { sampleFactor: this.details };
					const points = ft.textToPoints(char, 0, 0, 100, options);
					const bounds = ft.textBounds(char, 0, 0, 100);
					const groups = this.splitOnDistance(points).sort(
						(a, b) => calculateArea(a) + calculateArea(b)
					);
					// TODO: this could be done automatically with a sort on angle from the center and check if the angle increases or decreases
					if (this.reverseGroupsDirections) {
						for (let i = 1; i < groups.length; i++) {
							groups[i].reverse();
						}
					}
					return {
						value: char,
						line: lineIndex,
						word: wordIndex,
						groups: groups,
						bounds: bounds,
					};
				});
			});
		});
		pg.remove();
		return positions;
	};

	this.splitOnDistance = (points) => {
		let groups = [];
		let group = [];
		let hasBreaked = false;
		for (let i = 0; i < points.length; i++) {
			const actual = points[i];
			const next = i == points.length - 1 ? points[0] : points[i + 1];
			const d = this.p5.dist(actual.x, actual.y, next.x, next.y);
			group.push(actual);
			if (d > this.minDist) {
				groups.push(group);
				group = [];
				hasBreaked = true;
			}
		}
		if (hasBreaked == false) {
			groups.push(group);
		}
		return groups;
	};

	// there's surely a better way to do this
	this.flatten = (rawPoints) => {
		const letters = [];
		rawPoints.forEach((line) => {
			line.forEach((word) => {
				word.forEach((letter) => {
					letters.push(letter);
				});
			});
		});
		return letters;
	};
}
