/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

function Collision () {
	this.info = new  JSInfo ("No Sobreposition",
							 2.0,
							 "Collision Engine",
							 "Detect simple collisions");

	// Every module have its depends, they must be loaded first
	this.depends = ["math"];

	this.minkowskiSum = function (polyA,polyB) {
		var A,B;
		var minkowskiPoly;

		for (A in polyA) {
			for (B in polyB) {
				// The Minkowski Sum is a difference between point vectors
				minkowskiPoly.push (this.math.sub (polyA[A],polyB[B]))
			}
		}

		return minkowskiPoly;
	}

	this.GJKsupport = function (polyA,polyB,t) { // PolyA, PolyB & Direction
		var A,B,D; 		// D = dot product
		var a=0,b=0;   	// Final a,b

		t = this.math.normalize(t);

		D = this.math.dot (polyA[0],t);
		for (A=1;A<polyA.length;A++) {
			var d = this.math.dot(polyA[A],t); // Dot product
			if (d > D) {
				D = d;
				a = A;
			}
		}

		t = this.math.invert (t);

		D = this.math.dot (polyB[0],t);
		for (B=1;B<polyB.length;B++) {
			var d = this.math.dot(polyB[B],t); // Dot product
			if (d > D) {
				D = d;
				b = B;
			}
		}

		return this.math.sub (polyA[a],polyB[b]); // Do the Minkowski Sum (or Difference)
	}

	this.GJKsimplexLine = function (simplex,D) {
		var A=simplex[1],
			B=simplex[0];
		var AO = this.math.invert(A);
		var AB = this.math.sub (B,A);
		var newD = [];

		newD = this.math.normal (AB);
		if (this.math.dot (AO,newD) <= 0) {
			newD = this.math.invert (newD);
		}

		return newD;
	}

	this.GJKsimplexTriangle = function (simplex,D) {
		var a = simplex[2];
		var b = simplex[1];
		var c = simplex[0];

		var ao = this.math.invert(a);
		var ab = this.math.sub(b, a);
		var ac = this.math.sub(c, a);

		var abp = this.math.normal(ab);
		if(0 >= this.math.dot(abp, c)) {
		   abp = this.math.invert(abp);
		}

		if(0 <= this.math.dot(ao, abp)) {
		   acp = this.math.normal(ac);
		   if(0 >= this.math.dot(acp, b)) {
		      acp = this.math.invert(acp);
		   }

		   if(0 <= this.math.dot(ao, acp)) {
		      return false; // Origin is towards abp AND acp => HIT
		   }
		   simplex.splice(1,1);
		   return this.math.invert(acp);
		}
		// Origin is towards -abp
		simplex.splice(0,1);
		return this.math.invert(abp);
	}

	this.GJKsimplex = function (simplex,D) {
		var newD = [];

		if (simplex.length == 2) { // Line segment
			newD = this.GJKsimplexLine(simplex,D);
		}
		else if (simplex.length == 3) { // Triangle
			newD = this.GJKsimplexTriangle (simplex,D);
		}

		if (newD === false)
			return true;
		else
			return newD;
	}

	this.GJKcollisionInfo = function (simplex,colliding) {
		var dn = this.GJKdist (simplex);
		var ab = this.math.sub(simplex[1],simplex[0]);
		var col=false;
		var len = this.math.len(dn);

		if (dn[0] <= 0 && dn[1] >= 0)
			ab = this.math.sub(simplex[0],simplex[1]);

		if (this.math.dot (this.math.invert(colliding),ab) < 0) {
			len *= -1;
		}

		colliding = this.GJKclosest(simplex);

		return {d: dn, l: len,n: this.math.normal(ab), c: col, p: colliding};
	}

	this.GJKdist = function (simplex) {
		var A = simplex[1];
		var B = simplex[0];

		var AB = this.math.sub (B,A);
		var AO = this.math.invert (A);
	
		var t = this.math.dot (AO,AB)/this.math.dot (AB,AB);

		var d = this.math.add(this.math.mul (AB,t),A);
	
		return d;
	}

	this.GJKclosest = function (simplex) {
		return this.math.closestPointLinePoint ([0,0],simplex[0],simplex[1]);
	}

	this.GJK = function (polyA,polyB) {
		var D = [Math.random(),Math.random()]; 	// Direction
		var S = [],A=[]; 	// Point
		var L = [];			// List
		var P = [];
		var C = [];

		D = this.math.normalize (D);

		S = this.GJKsupport (polyA,polyB,D);
		
		L.push (S);
	
		D = this.math.invert (D);

		S = this.GJKsupport (polyA,polyB,D);

		L.push (S);

		var tol = 10;
		var pC = [];

		var n=0;

		while (true) {
			P = this.GJKclosest (L);

			if (P[0] == 0 && P[1] == 0) {
				return this.GJKcollisionInfo(L,P);
			}

			D = this.math.normalize(this.math.invert(P));

			C = this.GJKsupport (polyA,polyB,D);

			var dc = this.math.dot (C,D);
			var da = this.math.dot (L[0],D);
			var db = this.math.dot (L[1],D);

			if (dc-da <= tol && dc-db <= tol) {
				return this.GJKcollisionInfo(L,P);
			}

			if (this.math.len(L[1]) <= this.math.len(L[0])) {
				L[0] = this.math.copy(C);
			} else {
				L[1] = this.math.copy(C);
			}

			if (n>L.length)
				return this.GJKcollisionInfo(L,P);

			n++;
		}
	}

	this.SATintersect = function (l1,l2) {
		if ((l1[0] > l2[0] && l1[0] < l2[1])
			||
			(l1[1] > l2[0] && l1[1] < l2[1])
			||
			(l2[0] > l1[0] && l2[0] < l1[1])
			||
			(l2[1] > l1[0] && l2[1] < l1[1]))
			return l1[0]-l2[0]+l1[1]+l2[1];
		else
			return false;
	}

	this.SATgetNormals = function (q) {
		var vMath = jsEngine.modules.math;

		var v;
		var s = [0,0];
		var n = [];
		var k;
		for (v=0;v<q.length;v++) {
			s = vMath.sub(q[(v+1)%q.length],q[v]);
			k = [s[1],-s[0]];
			n.push (vMath.normalize(k));
		}

		return n;
	}


	this.SAT = function (q1,q2) {
		var vMath = jsEngine.modules.math;
		var normal = 3;
		var p,pt,s;
		var start = [html5.canvas.width/2,html5.canvas.height/2];
		var d = [0,0];
		start = [0,0];

		var n1 = this.SATgetNormals(q1);
		var n2 = this.SATgetNormals(q2);

		for (normal in n1) {
			//drawVector (start,v0);
			//drawVector (start,v1);

			var mm1 = [Number.MAX_VALUE,0];

			for (pt in q1) {
				var n = vMath.dot (q1[pt],n1[normal]);
				
				if (n < mm1[0])
					mm1[0] = n;
				if (n > mm1[1])
					mm1[1] = n;

				p = vMath.mul(n1[normal],n);

				/*
				html5.context.strokeStyle = "blue";
				drawDot (start,p);
				html5.context.strokeStyle = "red";
				drawVector (start,vMath.mul(n1[normal],1000));
				drawVector (start,vMath.mul(n1[normal],-1000));
				*/
			}

			var mm2 = [Number.MAX_VALUE,0];

			for (pt in q2) {
				var n = vMath.dot (q2[pt],n1[normal]);
				
				if (n < mm2[0])
					mm2[0] = n;
				if (n > mm2[1])
					mm2[1] = n;

				p = vMath.mul(n1[normal],n);

				/*
				html5.context.strokeStyle = "blue";
				drawDot (start,p);
				html5.context.strokeStyle = "red";
				drawVector (start,vMath.mul(n1[normal],1000));
				drawVector (start,vMath.mul(n1[normal],-1000));
				*/
			}

			if (!this.SATintersect (mm1,mm2))
				return false;


		for (normal in n2) {
			//drawVector (start,v0);
			//drawVector (start,v1);

			var mm1 = [Number.MAX_VALUE,0];

			for (pt in q1) {
				var n = vMath.dot (q1[pt],n2[normal]);
				
				if (n < mm1[0])
					mm1[0] = n;
				if (n > mm1[1])
					mm1[1] = n;

				p = vMath.mul(n2[normal],n);

				/*
				html5.context.strokeStyle = "blue";
				drawDot (start,p);
				html5.context.strokeStyle = "red";
				drawVector (start,vMath.mul(n2[normal],1000));
				drawVector (start,vMath.mul(n2[normal],-1000));
				*/
			}

			var mm2 = [Number.MAX_VALUE,0];

			for (pt in q2) {
				var n = vMath.dot (q2[pt],n2[normal]);
				
				if (n < mm2[0])
					mm2[0] = n;
				if (n > mm2[1])
					mm2[1] = n;

				p = vMath.mul(n2[normal],n);

				/*
				html5.context.strokeStyle = "blue";
				drawDot (start,p);
				html5.context.strokeStyle = "red";
				drawVector (start,vMath.mul(n2[normal],1000));
				drawVector (start,vMath.mul(n2[normal],-1000));
				*/
			}

			if (!this.SATintersect (mm1,mm2))
				return false;
		}

	}

		return true;
	}

}