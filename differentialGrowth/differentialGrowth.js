import { Quadtree, DataPoint, Circle, Rectangle } from "./quadTree.js";

function Point(p5, x, y, fixed = false) {
	this.p5 = p5;
	this.pos = this.p5.createVector(x, y);
	this.vel = this.p5.createVector(0, 0);
	this.acc = this.p5.createVector(0, 0);
	this.force = this.p5.createVector(0, 0);
	this.m = 0.5;
	this.fixed = fixed;
	this.drag = 0.8;
	this.collisionDist = 15; // This affects a lot how smooth the result will be: 5=detailed, 20=smooth

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
				this.force.add(rel.mult(1 / (d * .75 + 0.0001)));
			}
		}
		//this.checkBoundaries();
	};
	this.checkBoundaries = function () {
        const margins = 50
        // console.log(this.pos)

        this.pos.x = this.p5.constrain(this.pos.x,- this.p5.width/2 + margins,this.p5.width/2 - margins,)
        this.pos.y = this.p5.constrain(this.pos.y,- this.p5.height/2 + margins,this.p5.height/2 - margins,)

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
    this.p5 = p5
	const boundary = new Rectangle(0,0, p5.width, p5.height);
	this.tree = new Quadtree(boundary, 40);

	this.addShape = function (shape) {
		if (shape.length > 2) {
			const gl = new GrowingLine(p5, this);
			gl.build(shape);
			this.shapes.push(gl);
		}
	};

	this.getNeighbors = function (point) {
		return this.tree
			.query(new Circle(point.pos.x, point.pos.y, 30))
			.map((x) => x.data);
	};

	this.update = function (step) {
		this.tree = new Quadtree(boundary, 40);
		this.world.forEach((point) => {
			const { pos } = point;
			const np = new DataPoint(pos.x, pos.y, point);
			this.tree.insert(np);
		});

		this.shapes.forEach((shape) => shape.update(step));
	};
	this.display = function () {

        this.p5.push()
        this.p5.noStroke()
        this.p5.beginShape()
        this.shapes.forEach((shape,index) => shape.display(index));
        this.p5.endShape()
        this.p5.pop()
		
	};
}

function GrowingLine(p5, parent, closed = true) {
	this.springs = [];
	this.points = [];
	this.closed = closed;
	this.p5 = p5;
	this.parent = parent;

	this.build = function (shape) {
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
		var self = this;

        //console.log(this.springs.length,this.points.length)

		for (var s = 0; s < this.springs.length; s++) {
			this.springs[s].applyForces();
		}

		for (var p = 0; p < this.points.length; p++) {

            //console.log(this.points[p].vel)

			const others = this.parent.getNeighbors(this.points[p]);
			this.points[p].checkCollisions(others);
			//this.points[p].checkCollisions(p, this.points); // Slow

			this.points[p].updatePos(dt);
			this.points[p].resetForces();
		}
	};
	this.display = function (index) {
		
		if(index !== 0){
            //this.p5.vertex(this.points[0].pos.x, this.points[0].pos.y);
            this.p5.beginContour()
            
			
        }
		//this.p5.vertex(this.points[0].pos.x, this.points[0].pos.y);
		for (var p = 0; p < this.points.length + 3; p++) {
			//this.p5.curveVertex(this.points[p%this.points.length].pos.x, this.points[p%this.points.length].pos.y);
			this.p5.vertex(this.points[p%this.points.length].pos.x, this.points[p%this.points.length].pos.y);
		}
		
        if(index !== 0){
			
            this.p5.endContour()
        }
		
	};
}
