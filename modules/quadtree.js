/*
	This module implements quadtree and related functionality
*/

function Quadtree () {
	this.info = new JSInfo ("Squared World",
							0.1,
							"Quadtree",
							"Provides quadtree and related functionality");
	this.depends = ["math"];

	this.Quad = function (p0, p1, max) {
		// A quad is defined by two points
		this.p0 = p0;
		this.p1 = p1;
		// Max number of data supported by this quad
		this.max = max;

		// Children for this quad
		this.children = [];
	
		// Data for this quad
		this.data = [];

		// Create quadrants
		this.createQuads = function () {
			var sx = this.p0[0];
			var mx = (this.p0[0]+this.p1[0])/2;
			var ex = this.p1[0];
			var sy = this.p0[1];
			var my = (this.p0[1]+this.p1[1])/2;
			var ey = this.p1[1];

			// Q2
			this.children.push (new jsEngine.modules.quadtree.Quad(
				[sx,sy],
				[mx,my],
				this.max
			));
			// Q4
			this.children.push (new jsEngine.modules.quadtree.Quad(
				[mx,my],
				[ex,ey],
				this.max
			));
			// Q1
			this.children.push (new jsEngine.modules.quadtree.Quad(
				[mx,sy],
				[ex,my],
				this.max
			));
			// Q3
			this.children.push (new jsEngine.modules.quadtree.Quad(
				[sx,my],
				[mx,ey],
				this.max
			));
		}

		// Add point
		this.add = function (p) {
			if (this.inside (p)) {
				// Can I still add points to myself?
				if (this.max > this.data.length) {
					// Yep
					this.data.push(p);
				} else {
					// Nope
					// Create quadrants if none
					if (this.children.length == 0)
						this.createQuads();
					// Add depending upon quadrant
					for (var q=0;q<this.children.length;q++) {
						if (this.children[q].inside(p)) {
							this.children[q].add(p);
							break;
						}
					}
				}
			}
		}

		// Verifies if a point is inside the quad
		this.inside = function (p) {
			if (p[0] >= this.p0[0] &&
				p[0] <= this.p1[0] &&
				p[1] >= this.p0[1] &&
				p[1] <= this.p1[1])
				return true;
			return false;
		}

		// Verifies if there is an intersection
		this.intersect = function (quad) {
			if (this.inside (quad.p0) ||
				this.inside ([quad.p0[0],quad.p1[1]]) ||
				this.inside (quad.p1) ||
				this.inside ([quad.p1[0],quad.p0[1]]) ||
				quad.inside (this.p0) ||
				quad.inside ([this.p0[0],this.p1[1]]) ||
				quad.inside (this.p1) ||
				quad.inside ([this.p1[0],this.p0[1]]))
				return true;
			return false;
		}

		// Returns all points inside a quad
		this.query = function (quad) {
			var ret = [];
			// We only check if there is an real intersection, of course!
			if (this.intersect(quad)) {
				for (var p in this.data) {
					if (quad.inside(this.data[p]))
						ret.push(this.data[p]);
				}
				var q;
				for (var c in this.children) {
					q = this.children[c].query(quad);
					for (var p in q) {
						ret.push(q[p]);
					}
				}
			}
			return ret;
		}
	}

	this.Quadtree = function (p0, p1) {
		this.root = new Quad(p0, p1);
	}
}