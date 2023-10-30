export class Rectangle {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	contains(point) {
		return (
			point.x >= this.x - this.w &&
			point.x <= this.x + this.w &&
			point.y >= this.y - this.h &&
			point.y <= this.y + this.h
		);
	}

	intersects(range) {
		return !(
			range.x - range.w > this.x + this.w ||
			range.x + range.w < this.x - this.w ||
			range.y - range.h > this.y + this.h ||
			range.y + range.h < this.y - this.h
		);
	}
}

export class Circle {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.rSquared = this.r * this.r;
	}

	contains(point) {
		let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
		return d <= this.rSquared;
	}

	intersects(range) {
		let xDist = Math.abs(range.x - this.x);
		let yDist = Math.abs(range.y - this.y);
		let r = this.r;
		let w = range.w;
		let h = range.h;
		let edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);
		if (xDist > r + w || yDist > r + h) return false;
		if (xDist <= w || yDist <= h) return true;
		return edges <= this.rSquared;
	}
}

export class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = 2;
		this.highlight = false;
	}

	intersects(other) {
		let d = dist(this.x, this.y, other.x, other.y);
		return d < this.r + other.r;
	}

	setHighlight(value) {
		this.highlight = value;
	}

	move() {
		this.x += random(-1, 1);
		this.y += random(-1, 1);
	}

	render() {
		noStroke();
		fill(this.highlight ? 255 : 100);
		ellipse(this.x, this.y, this.r * 2);
	}
}

export class DataPoint {
	constructor(x, y, data) {
		this.x = x;
		this.y = y;
		this.data = data;
	}
}

export class Quadtree {
	constructor(boundary, capacity) {
		this.boundary = boundary;
		this.capacity = capacity;
		this.points = [];
	}

	insert(newPoint) {
		if (this.points.length < this.capacity) {
			this.points.push(newPoint);
		} else {
			if (!this.divided) {
				this.subdivide();
			}

			const pointsToRedistribute = [...this.points, newPoint];
			this.points = [];
			pointsToRedistribute.forEach((point) => {
				if (this.ne.boundary.contains(point)) {
					this.ne.insert(point);
				} else if (this.nw.boundary.contains(point)) {
					this.nw.insert(point);
				} else if (this.se.boundary.contains(point)) {
					this.se.insert(point);
				} else if (this.sw.boundary.contains(point)) {
					this.sw.insert(point);
				} else {
					console.warn("could not place point in subtree:", point);
				}
			});
		}
	}

	subdivide() {
		const x = this.boundary.x;
		const y = this.boundary.y;
		const hw = this.boundary.w / 2;
		const hh = this.boundary.h / 2;
		const ne = new Rectangle(x + hw, y - hh, hw, hh);
		const nw = new Rectangle(x - hw, y - hh, hw, hh);
		const se = new Rectangle(x + hw, y + hh, hw, hh);
		const sw = new Rectangle(x - hw, y + hh, hw, hh);
		this.ne = new Quadtree(ne, this.capacity);
		this.nw = new Quadtree(nw, this.capacity);
		this.se = new Quadtree(se, this.capacity);
		this.sw = new Quadtree(sw, this.capacity);
		this.divided = true;
	}

	query(range, found = []) {
		if (!this.boundary.intersects(range)) {
			return [];
		} else {
			for (let p of this.points) {
				if (range.contains(p)) {
					found.push(p);
				}
			}
			if (this.divided) {
				this.ne.query(range, found);
				this.nw.query(range, found);
				this.se.query(range, found);
				this.sw.query(range, found);
			}
			return found;
		}
	}

	visualize() {
		strokeWeight(1);
		stroke(255);
		noFill();
		rectMode(CENTER);
		rect(
			this.boundary.x,
			this.boundary.y,
			this.boundary.w * 2,
			this.boundary.h * 2
		);

		if (this.divided) {
			this.ne.visualize();
			this.nw.visualize();
			this.se.visualize();
			this.sw.visualize();
		}

		for (let p of this.points) {
			strokeWeight(3);
			point(p.x, p.y);
		}
	}
}
/*
let useQuadtree = true,
	defaultChecks = 0;
const fps = document.getElementById("fps");
const toggle = document.getElementById("useQuadtree");
toggle.addEventListener("change", (e) => {
	useQuadtree = e.target.checked;
});

let qtree;
const particles = [];

function setup() {
	createCanvas(400, 400);

	for (let i = 0; i < 1500; i++) {
		particles[i] = new Particle(random(width), random(height));
	}

	defaultChecks = particles.length * particles.length;
}

function draw() {
	background("#111");

	if (useQuadtree) {
		const boundary = new Rectangle(200, 200, 400, 400);
		qtree = new Quadtree(boundary, 40);
	}

	for (let p of particles) {
		p.move();

		if (useQuadtree) {
			const point = new Point(p.x, p.y, p);
			qtree.insert(point);
		}

		p.render();
		p.setHighlight(false);
	}

	let checks = 0;
	for (let p of particles) {
		const others = useQuadtree
			? qtree.query(new Circle(p.x, p.y, p.r * 2)).map((x) => x.data)
			: particles;

		for (let other of others) {
			if (p !== other && p.intersects(other)) {
				p.setHighlight(true);
			}
			checks++;
		}
	}

	const gain = 100 - (checks / defaultChecks) * 100;
	fps.innerHTML = `FPS: ${frameRate().toFixed()}<br>
    Particle count: ${particles.length}<br>
    Checks: ${checks}<br>
    Check reduction: ${gain.toFixed(3)}%`;
}
*/