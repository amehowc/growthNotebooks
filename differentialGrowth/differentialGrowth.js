import { Quadtree, DataPoint, Circle, Rectangle } from "./quadTree.js";

function Point(p5, x, y, fixed = false) {
	this.p5 = p5;
	this.pos = this.p5.createVector(x, y);
	this.vel = this.p5.createVector(0, 0);
	this.acc = this.p5.createVector(0, 0);
	this.force = this.p5.createVector(0, 0);
	this.m = 0.5;
	this.fixed = fixed;
	this.drag = 0.9;

	this.collisionDist = 20; // This affects a lot how smooth the result will be: 5=detailed, 20=smooth

	this.resetForces = function () {
		this.force.mult(0);
	};

	this.addForce = function (f) {
		this.force.add(f);
	};
	this.updatePos = function (dt) {
		if (!this.fixed) {
			this.acc = this.force.div(this.m);
			this.vel.add(this.acc.copy().mult(dt));
			this.pos.add(this.vel.copy().mult(dt));
			this.vel.mult(this.drag);
		}
	};
	this.fix = function () {
		this.fixed = true;
	};
	// Not efficient, should only check n neighbour points
	this.checkCollisions = function (points) {
		this.checkBoundaries();
		for (let p of points) {
			let rel = this.pos.copy().sub(p.pos.copy());
			let d = rel.mag();
			if (d < this.collisionDist) {
				this.force.add(rel.mult(1 / (d * 0.75 + 0.01)));
			}
		}
		//this.checkBoundaries();
	};
	this.checkBoundaries = function () {
		const margins = 50;
		// console.log(this.pos)

		this.pos.x = this.p5.constrain(
			this.pos.x,
			-this.p5.width / 2 + margins,
			this.p5.width / 2 - margins
		);
		this.pos.y = this.p5.constrain(
			this.pos.y,
			-this.p5.height / 2 + margins,
			this.p5.height / 2 - margins
		);

		// if (
		// 	this.pos.x > this.p5.width/2 - margins || this.pos.x < - this.p5.width/2 + margins ||
		//     this.pos.y > this.p5.height/2 - margins || this.pos.y < - this.p5.height/2 + margins
		// ) {
		// 	this.fix();
		// }
	};
}

function Spring(pointA, pointB, l, k = 0.9) {
	this.pointA = pointA;
	this.pointB = pointB;
	this.restLen = l;
	this.k = k;
	this.applyForces = function () {
		let vecAB = this.pointB.pos.copy().sub(this.pointA.pos.copy());
		let forceMag = this.k * (this.restLen - vecAB.mag());
		let forceAB = vecAB.setMag(forceMag);
		let forceBA = forceAB.copy().mult(-1);
		this.pointA.addForce(forceBA);
		this.pointB.addForce(forceAB);
	};
}

// Growing line by insertion of points

export default function GrowingShapes(p5) {
	this.shapes = [];
	this.world = [];
	this.p5 = p5;
	const boundary = new Rectangle(0, 0, p5.width, p5.height);
	this.tree = new Quadtree(boundary, 40);

	this.addShape = function (shape, index, group) {
		if (shape.length > 0) {
			const gl = new GrowingLine(p5, this, index, group);
			gl.build(shape);
			this.shapes.push(gl);
		}
	};

	this.addShapes = function (_shapes) {
		const { shapes, group } = _shapes;

		console.log(_shapes);

		shapes.forEach((shape, index) => {
			this.addShape(
				shape.map((pt) => {
					return {
						x: pt.x * 2,
						y: pt.y * 2,
					};
				}),
				index,
				group
			);
		});
	};

	this.getNeighbors = function (point) {
		return this.tree
			.query(new Circle(point.pos.x, point.pos.y, 30))
			.map((x) => x.data);
	};

	this.update = function (step) {
		this.tree = new Quadtree(boundary, 20);
		this.world.forEach((point) => {
			const { pos } = point;
			const np = new DataPoint(pos.x, pos.y, point);
			this.tree.insert(np);
		});

		this.shapes.forEach((shape) => shape.update(step));
	};

	this.groupShapes = function (shape = this.shapes) {
		const shapes = {};
		shape.forEach((obj) => {
			const groupKey = obj.group.toString();
			if (!shapes[groupKey]) {
				shapes[groupKey] = [];
			}
			shapes[groupKey].push(obj);
		});

		return shapes;
	};

	this.display = function () {
		this.p5.push();
		this.p5.noStroke();
		const shapes = this.groupShapes();
		for (let shape in shapes) {
			const groups = shapes[shape];
			this.p5.beginShape();
			for (let i = 0; i < groups.length; i++) {
				const line = groups.at(i);
				line.display();
			}
			this.p5.endShape(this.p5.CLOSE);
		}
		this.p5.pop();
	};
}

function GrowingLine(p5, parent, index, group = 0, closed = true) {
	this.springs = [];
	this.points = [];
	this.closed = closed;
	this.p5 = p5;
	this.parent = parent;
	this.index = index;
	this.group = group;

	function simplifyPath(points, epsilon = 0.01) {
		// Find the point with the maximum distance from line between the start and end
		let dmax = 0;
		let index = 0;
		let end = points.length - 1;

		for (let i = 1; i < end; i++) {
			let d = pointLineDistance(points[i], points[0], points[end]);
			if (d > dmax) {
				index = i;
				dmax = d;
			}
		}

		// If max distance is greater than epsilon, recursively simplify
		if (dmax > epsilon) {
			let recResults1 = simplifyPath(points.slice(0, index + 1), epsilon);
			let recResults2 = simplifyPath(points.slice(index, end + 1), epsilon);

			// Build the final list
			return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
		} else {
			return [points[0], points[end]]; // Only endpoints
		}
	}

	function pointLineDistance(point, lineStart, lineEnd) {
		let A = point.x - lineStart.x;
		let B = point.y - lineStart.y;
		let C = lineEnd.x - lineStart.x;
		let D = lineEnd.y - lineStart.y;

		let dot = A * C + B * D;
		let lenSq = C * C + D * D;
		let param = -1;
		if (lenSq !== 0)
			// Avoid division by zero
			param = dot / lenSq;

		let xx, yy;

		if (param < 0) {
			xx = lineStart.x;
			yy = lineStart.y;
		} else if (param > 1) {
			xx = lineEnd.x;
			yy = lineEnd.y;
		} else {
			xx = lineStart.x + param * C;
			yy = lineStart.y + param * D;
		}

		let dx = point.x - xx;
		let dy = point.y - yy;
		return Math.sqrt(dx * dx + dy * dy);
	}

	this.build = function (shape) {
		// to redo : shitty shapes
		//const simplifiedShape = simplifyPath(shape);
		//console.log(simplifiedShape);
		shape.forEach((pt) => this.addPoint(pt.x, pt.y, false, 5));
	};

	this.addPoint = function (x, y, fixed = false, len) {
		const point = new Point(this.p5, x, y, fixed);
		this.points.push(point);
		this.parent.world.push(point);
		if (this.points.length > 1) {
			if (this.closed) {
				this.springs.pop();
			}
			this.springs.push(
				new Spring(
					this.points[this.points.length - 2],
					this.points[this.points.length - 1],
					len
				)
			);
			if (this.closed) {
				this.springs.push(
					new Spring(this.points[this.points.length - 1], this.points[0], len)
				);
			}
		}
	};

	this.insertPoint = function (fixed = false, len0, len1, firstIndex) {
		if (this.points.length > 1) {
			let acc = this.points[firstIndex].pos
				.copy()
				.add(this.points[firstIndex + 1].pos.copy());
			let midPos = acc.copy().mult(0.5);

			const point = new Point(this.p5, midPos.x, midPos.y, fixed);
			this.parent.world.push(point);

			this.points.splice(firstIndex + 1, 0, point);
			this.springs.splice(
				firstIndex,
				1,
				new Spring(this.points[firstIndex], this.points[firstIndex + 1], len0)
			);
			this.springs.splice(
				firstIndex + 1,
				0,
				new Spring(this.points[firstIndex + 1], this.points[firstIndex + 2], len1)
			);
		}
	};
	this.update = function (dt) {
		let self = this;
		for (var s = 0; s < this.springs.length; s++) {
			this.springs[s].applyForces();
		}

		for (var p = 0; p < this.points.length; p++) {
			//console.log(this.points[p].vel)
			const others = this.parent.getNeighbors(this.points[p]);
			this.points[p].checkCollisions(others);
			this.points[p].updatePos(dt);
			this.points[p].resetForces();
		}
	};
	this.display = function () {
		if (this.index !== 0) {
			this.p5.beginContour();
		}

		this.p5.vertex(this.points[0].pos.x, this.points[0].pos.y);

		for (var p = 0; p < this.points.length + 1; p++) {
			this.p5.curveVertex(
				this.points[p % this.points.length].pos.x,
				this.points[p % this.points.length].pos.y
			);
			// this.p5.vertex(
			// 	this.points[p % this.points.length].pos.x,
			// 	this.points[p % this.points.length].pos.y
			// );
		}
		
		if (this.index !== 0) {
			this.p5.endContour(this.p5.CLOSE);
		}
	};
}
