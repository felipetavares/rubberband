/*
	Este módulo é utilizado para testar a colisão de tiros com paredes e encontrar a colisão mais próxima
*/

function ShotManager () {
	this.info = new JSInfo ("Armor",
							0.1,
							"Shot manager",
							"Controls all hi-speed shooting");
	this.depends = ["math"];

	this.shots = [];

	this.boxNormals = [
		[0,-1],
		[-1,0],
		[1,0],
		[0,1],
	];
	
	this.addShot = function (s) {
		this.shots.push (s);
	}
	
	this.step = function () {
		var collisions = [];
	
		var objs = [];
		var vm = jsEngine.modules.math;

		for (var o in jsEngine.modules.render.renderer.scene.staticObjects) {
			objs.push(jsEngine.modules.render.renderer.scene.staticObjects[o]);			
		}
	
		for (var i=1;i<jsEngine.modules.render.renderer.scene.dynamicObjects.length;i++) {
			objs.push(jsEngine.modules.render.renderer.scene.dynamicObjects[i]);
		}

		for (var s=0;s<this.shots.length;s++) {
			for (var o in objs) {
				if (objs[o].physics.r == false && this.shots[s][3]) {
					continue;
				}
				var lines = objs[o].getLines();
				for (var l in lines) {
					var sl = vm.sub(this.shots[s][1],this.shots[s][0]);
				
					if (vm.dot(vm.normalize(sl),this.boxNormals[l]) > 0)
						continue;
				
					var p = jsEngine.modules.math.rayLineIntersection (this.shots[s], lines[l]);
					
					// We have a collision!
					if (p) {
						var dist = vm.dist2(this.shots[s][0],p);
						
						for (var c=0;c<collisions.length+1;c++)
							if (c == collisions.length ||
								dist < collisions[c][1]) {
								var obj = [p,dist,this.boxNormals[l],this.shots[s],objs[o],this.shots[s][2]];
								collisions.splice(c,0,obj);
								break;
							}
					}
				}
			}

			// For testing, we comment this line
			this.shots.splice(0,1);
			s--;
		}

		html5.context.fillStyle = "green";
		html5.context.textAlign = "left";
		html5.context.textBaseline = "middle";
		html5.context.font = 10+"px Lucida Console";
	
		for (var c in collisions) {
			html5.context.fillStyle = "red";
			html5.context.fillText(""+Math.sqrt(collisions[c][1]),10+collisions[c][0][0]-1,collisions[c][0][1]-1);
			html5.context.fillRect(collisions[c][0][0]-1,collisions[c][0][1]-1,3,3);

			var n = collisions[c][2];
			var d = vm.sub(collisions[c][0],collisions[c][3][0]);
						
			var finalDirection = vm.invert(vm.normalize(vm.sub(d,vm.mul(vm.mul(n,vm.dot(d,n)),2))));
			//var finalDirection = d;

			var p = collisions[c][0];
			
			//if (n[1] != 0) {
			//	p = vm.add(p,vm.mul(vm.invert(n), collisions[c][4].height/4+collisions[c][4].height/4*Math.random()))
			//}

			//jsEngine.modules.decal.addDecal (
			//	new Decal (p,"assets/images/bullethole/simple.png")
			//);
			
			collisions[c][5](p,finalDirection,collisions[c][4]);

			break;
		}
	}
}