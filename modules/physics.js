/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

function CollisionInfo (x,y,vx,vy) {
    this.p = [x,y];
    this.d = [vx,vy];
}

function Physics () {
	this.info = new  JSInfo ("Solid Paper",
							 1.1,
							 "Physics Engine",
							 "Controls all physics calculations in the engine");

	// Every module have its depends, they must be loaded first
	this.depends = ["collision","math"];

    this.s_objects = []; /* Static objects */
    this.d_objects = []; /* Dynamic ones   */

	this.collisionCallback = false;
	this.vcollision = false;

	this.cList = [];
	
    this.step = function () {
		var s,d,cf,d_real,d_run,d_run_old;
		
		for (d=0;d<this.d_objects.length;d++) {
			this.d_objects[d].v[0] += this.d_objects[d].a[0]*jsEngine.dt;
			this.d_objects[d].v[1] += this.d_objects[d].a[1]*jsEngine.dt;

			if (this.d_objects[d]._onFloor) {
				this.d_objects[d]._onFloor = false;
				this.d_objects[d].onFloor = true;
			}
			else if (this.d_objects[d].onFloor) {
				this.d_objects[d].onFloor = false;
			}

			if (this.vcollision) {
				if (this.collisionCallback) {
					this.collisionCallback(this.vcollision[0],this.vcollision[1]);
				}
				this.vcollision = false;
			}

			for (var sh in this.d_objects[d].shapes) {
				this.d_objects[d].shapes[sh].p = this.math.add(this.d_objects[d].p,this.d_objects[d].shapes[sh].pc);
				for (s=0;s<this.s_objects.length;s++) {
					if (cf = this.circleAABB(this.d_objects[d].shapes[sh],this.s_objects[s])) {			
						d_real = this.math.len(cf.d)-this.d_objects[d].shapes[sh].r;
						d_run = -jsEngine.dt*this.math.dot(this.math.normalize(cf.d),this.d_objects[d].v);
						d_run_old = this.math.len(this.d_objects[d].v);

						if (d_run > d_real) {
							if (this.s_objects[s].r) {
								for (var k=0;;k++)
									if (k == this.cList.length ||
										(d_run-d_real) < this.cList[k][2]) {
										this.cList.splice(k,0,[this.d_objects[d],
																this.s_objects[s],
																this.d_objects[d].shapes[sh],
																cf]);
										break;
									}
							}
						}
					}
				}
			}
		}
		
		/* Solve collisions */
		for (var c in this.cList) {
			var dy = this.cList[c][0];
			var st = this.cList[c][1];
			cf = this.cList[c][3];
			var shape = this.cList[c][2];
			d_real = this.math.len(cf.d)-shape.r;
			d_run = -jsEngine.dt*this.math.dot(this.math.normalize(cf.d),dy.v);

			dist = (d_run-d_real);
			
			if (Math.abs(dy.v[0]) > 0.001 || d_real < -1)
				dy.v[0] += dist*((this.math.normalize(cf.d)[0]))/jsEngine.dt;	
			if (Math.abs(dy.v[1]) > 0.001 || d_real < -1)
				dy.v[1] += dist*((this.math.normalize(cf.d)[1]))/jsEngine.dt;
			
			if (this.math.dot(this.math.normalize(cf.d),dy.floor) == 1.0)
				dy._onFloor = true;

			if (dy.v[0] != 0) {
				dy.v[0] *= dy.f * st.f;
			}
			if (dy.v[1] != 0) {
				dy.v[1] *= dy.f * st.f;
			}

			if (!this.vcollision) {
				this.vcollision = [0,0];
				this.vcollision[0] = st;
				this.vcollision[1] = dy;
			}
		}
		
		this.cList = [];
	
		for (d in this.d_objects)
			this.d_objects[d].step();
	}

    /* 
     * Collision detection and response
     * functions goes here 
     */

	this.clamp = function (v,min,max) {
		if (v > max)
			v = max;
		else if (v < min)
			v = min;

		return v;
    }

    this.circleAABB = function (circle,aabb) {
		closestX = this.clamp(circle.p[0], aabb.p[0], aabb.p[0]+aabb.s[0]);
		closestY = this.clamp(circle.p[1], aabb.p[1]+aabb.depth, aabb.p[1]+aabb.s[1]);

		distanceX = circle.p[0] - closestX;
		distanceY = circle.p[1] - closestY;

		cf = new CollisionInfo(closestX,closestY,distanceX,distanceY);
		return cf;
	}

    this.pushCircle = function (circle,cf) {
		vn = this.math.normalize(cf.d[0],cf.d[1]);

		e = 0.5;

		circle.v[0] -= (1+e)*vn[0]*(circle.v[0]*vn[0]);
		circle.v[1] -= (1+e)*vn[1]*(circle.v[1]*vn[1]);

		vn[0] *= circle.r;
		vn[1] *= circle.r;

		circle.p[0] += vn[0]-cf.d[0];
		circle.p[1] += vn[1]-cf.d[1];

		return vn;
    }   

	this.Circle = function (r,pc) {
		// Distance from object's center
		this.pc = pc;
		
		this.p = [0,0];
		this.r = r;
	}
	
	this.DynamicObject = function() {
		this.shapes = [];

		this.f = 1.0;

		this.p = [0,0];
		this.v = [0,0];
		this.a = [0,0];

		this.onFloor = false;
		this._onFloor = false; /* Player *will* be on floor, next frame */
		this.floor = [0,-1];

		this.cg = 1;

		this.step = function () {	
			this.p[0] += this.v[0]*jsEngine.dt;
			this.p[1] += this.v[1]*jsEngine.dt;
		}

		this.hull = function () {
			return [
				[this.p[0],this.p[1]],
				[this.p[0]+this.r*2,this.p[1]],
				[this.p[0]+this.r*2,this.p[1]+this.r*2],
				[this.p[0],this.p[1]+this.r*2],
			];
		}
	}

	this.StaticObject = function (w,h,depth) {
		this.p = [0,0];
		this.s = [w,h];
		this.f = 1.0;
		this.cg = 1;
		//this.depth = depth;
		// For plataformers
		this.depth = 0;

		this.r = true; /* Collision response? */

		this.hull = function () {
			return [
				[this.p[0],this.p[1]],
				[this.p[0]+this.s[0],this.p[1]],
				[this.p[0]+this.s[0],this.p[1]+this.s[1]],
				[this.p[0],this.p[1]+this.s[1]],
			];
		}
	}
}