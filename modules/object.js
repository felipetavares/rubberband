/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

/*
	This module implements a basic object
*/

function GameObject () {
	this.info = new JSInfo ("Block",
							0.1,
							"Game Object",
							"Controls everything in a game object");
	this.depends = ["physics"];

	this.StaticObject = function (image,w,h,col,depth) {
		this.image = image;
		this.w = w;
		this.h = h;

		if (depth)
			this.height = html5.image(this.image).height;
		else
			this.height = 0;

		if (depth)
			this.depth = depth;
		else
			this.depth = 0;

		this.physics = new jsEngine.modules.physics.StaticObject(w,h,this.depth);
		this.physics.r = col;
		
		jsEngine.modules.physics.s_objects.push(this.physics);

		this.getLines = function () {
			var lines = [];
			var vm = jsEngine.modules.math;

			var p = vm.copy (this.physics.p);
			var s = vm.copy (this.physics.s);
			
			lines.push([p,vm.add(p, [s[0],0])]);
			lines.push([p,vm.add(p, [0,s[1]])]);
			lines.push([vm.add(p, [s[0],0]),vm.add(p,s)]);
			lines.push([vm.add(p, [0,s[1]]),vm.add(p,s)]);
			
			return lines;
		}

		this.step = function () {

		}

		this.render = function () {
			html5.context.drawImage (html5.image(this.image),this.physics.p[0],this.physics.p[1]);
		}

		jsEngine.modules.actions.createObject(this);
	}

	this.Player = function () {
		this.physics = new jsEngine.modules.physics.DynamicObject();
		this.physics.p[0] += 360;
		this.physics.p[1] += 350;
		this.physics.a[1] = 99;

		this.physics.shapes.push (new jsEngine.modules.physics.Circle(3,[3,25]))
		
		this.height = 59;
		
		this.depth  = 60;
		this.bottom = 0;
		this.d = 0;

		this.dirs = false;

		jsEngine.modules.physics.d_objects.push(this.physics);

		this.interact = function (p, d, o) {
			if (o.open)
				o.open(this);
			//else
			//	jsEngine.modules.messages.addMessage (new Message("I can't open this!"));
		}

		this.shot = function (p, d, o) {

			if (o.shot) {
				o.shot(d);
				jsEngine.modules.particles.addSystem (
					new DirectionalExplosion (p[0],p[1],
											  "rgb(128,0,0)", 40, d)
				);
			} else {
				jsEngine.modules.particles.addSystem (
					new DirectionalExplosion (p[0],p[1],
											  "rgb(200,200,200)", 10, jsEngine.modules.math.invert(d))
				);
				jsEngine.modules.particles.addSystem (
					new DirectionalExplosion (p[0],p[1],
											  "rgb(255,200,20)", 40, d)
				);
			}
		}

		this.state = 0;
		this.stateStep = 0;
		this.jumpTarget = [0,0];
		this.jumpObject = null;

		this.jump = function (o) {
			this.state = 1;
			this.stateStep = 0;
			this.jumpObject = o;
		}

		this.step = function () {
			var play = true;

			if (this.physics.v[0] > 1) {
				this.dirs = true;
			} else
			if (this.physics.v[0] < -1) {
				this.dirs = false;
			} else
			if (this.physics.v[1] < -1) {
			} else
			if (this.physics.v[1] > 1) {
			} else {
				play = false;
			}

			this.standing = Math.abs(this.physics.v[0]+this.physics.v[1])>0.1?0:1;

			var vm = jsEngine.modules.math;

			if (this.state == 0) {			
				this.maskElevation = 0;
				//this.physics.v = [0,0];

				
				//this.anim = 2;
				//this.standing = 0;
				//play = true;
				
				if (html5.keyboard[html5.keyUp] && this.physics.onFloor) {
					html5.keyboard[html5.keyUp] = false;
					var base = vm.add(this.physics.p,[4,17]);
					var m = this.dirs?vm.add(base,[4,0]):vm.add(base,[-5,0]);
					jsEngine.modules.shot.addShot([base,m,html5.hitch(this.interact, this)]);
				}

				if (html5.keyboard[html5.keyDown]) {
					this.state = 2;
				}

				if (html5.keyboard[html5.keyLeft]) {
					this.anim = 0;
					this.physics.v[0] -= 4;
				}
				if (html5.keyboard[html5.keyRight]) {
					this.anim = 0;
					this.physics.v[0] += 4;
				}
				
				this.physics.v[0] *= 0.8;
			} else if (this.state == 1) {
				switch (this.stateStep) {
					case 0:
						this.physics.a[1] = 0;
						this.physics.shapes[0].pc[1] -= 12;
						this.anim = 1;
						this.physics.v[1] -= 99;
						this.jumpTarget[1] = this.physics.p[1]-(this.jumpObject.h-12);
						this.jumpTarget[0] = this.dirs?this.physics.p[0]+this.jumpObject.w+5:this.physics.p[0]-(this.jumpObject.w+5);
						this.stateStep++;
					break;
					case 1:
						this.physics.a[1] = 0;
						if (this.physics.p[1] <= this.jumpTarget[1])
							this.stateStep++;
					break;
					case 2:
						this.physics.p[1] = this.jumpTarget[1];
						this.maskElevation = 3;
						this.physics.v[1] = 0;
						this.physics.v[0] += this.dirs?10:-10; 
						if (this.dirs) {
							if (this.physics.p[0] >= this.jumpTarget[0])
								this.stateStep++;
						} else {
							if (this.physics.p[0] <= this.jumpTarget[0])
								this.stateStep++;
						}
					break;
					case 3:
						var aid = this.animList[this.anim][0];
						this.physics.v[1] += 30;
						this.physics.a[1] = 99;
						jsEngine.modules.animation.stopAnimationAt(aid,0);
						this.physics.v[0] = 0;
						this.physics.shapes[0].pc[1] += 12;
						this.anim = 0;
						this.state = 0;
						this.stateStep = 0;
				}
			} else if (this.state == 2) {
				this.physics.v[0] = 0;
				switch (this.stateStep) {
					case 0:
						this.anim = 2;
						this.stateStep++;
					break;
					case 1:
						play = true;
						var aid = this.animList[this.anim][0];
						if (jsEngine.modules.animation.animInfo[aid].currentFrameN >= 6) {
							play = false;
							if (html5.keyboard[html5.keyX])
								this.stateStep++;
							if (!html5.keyboard[html5.keyDown])
								this.stateStep = 4;
						}
					break;
					case 2:
						play = true;
						var base = vm.add(this.physics.p,[4,8]);
						var m = this.dirs?vm.add(base,[250,0]):vm.add(base,[-250,0]);
						jsEngine.modules.shot.addShot([base,m,html5.hitch(this.shot, this),true]);
						this.stateStep++;
					break;
					case 3:
						play = true;
						var aid = this.animList[this.anim][0];
						if (jsEngine.modules.animation.animInfo[aid].currentFrameN == 9) {
							var aid = this.animList[this.anim][0];
							jsEngine.modules.animation.stopAnimationAt(aid,6);
							this.stateStep=1;
						}
					break;
					case 4:
						var aid = this.animList[this.anim][0];
						jsEngine.modules.animation.stopAnimationAt(aid,0);

						this.anim = 0;
						this.state = 0;
						this.stateStep = 0;
				}
			}

			var aid = this.animList[this.anim][0/*this.standing*/];

			if (play) {
				jsEngine.modules.animation.playAnimation(aid);
			} else {
				jsEngine.modules.animation.stopAnimation(aid);
			}
		}

		this.animList = [
			[jsEngine.modules.animation.makeAnimation("assets/animation/player/",true,true),null],
			[jsEngine.modules.animation.makeAnimation("assets/animation/player-jump/"),null],
			[jsEngine.modules.animation.makeAnimation("assets/animation/player-shoting/"),null],
		];
		
		this.anim = 0;
		this.standing = 0;
		this.maskElevation = 0;

		this.render = function () {
			var aid = this.animList[this.anim][0];
			var img1 = jsEngine.modules.animation.getAnimationImage1(aid);
			
			html5.context.save();
			html5.context.translate(this.physics.p[0]+img1.width/2,this.physics.p[1]+img1.height/2);

			if (this.dirs)
				html5.context.scale (1,1);
			else
				html5.context.scale (-1,1);

			var mask = html5.image("assets/images/back/nocol/mask.png");

			html5.context.drawImage (img1,-img1.width/2,-img1.height/2);
			html5.context.drawImage (mask, -img1.width/2,-img1.height/2+this.maskElevation)
			html5.context.restore();
		}
	}

	this.Person = function () {
		this.physics = new jsEngine.modules.physics.DynamicObject();
		this.physics.p[0] = 300+400*Math.random();
		this.physics.p[1] += 350;
		this.physics.a[1] = 99;

		this.physics.shapes.push (new jsEngine.modules.physics.Circle(3,[3,25]))
		
		this.height = 59;
		
		this.depth  = 60;
		this.bottom = 0;
		this.d = 0;

		this.dirs = false;

		jsEngine.modules.physics.d_objects.push(this.physics);

		this.speed = (Math.random()*4+2)*(Math.random()>0.5?1:-1);

		this.step = function () {
			var play = true;

			if (this.physics.v[0] > 1) {
				if (this.anim == 0)
					this.dirs = true;
			} else
			if (this.physics.v[0] < -1) {
				if (this.anim == 0)
					this.dirs = false;
			} else
			if (this.physics.v[1] < -1) {
			} else
			if (this.physics.v[1] > 1) {
			} else {
				this.speed *= -1;
				play = false;
			}

			this.standing = 0;Math.abs(this.physics.v[0]+this.physics.v[1])>0.1?0:1;

			var vm = jsEngine.modules.math;
			
			this.physics.v[0] += this.speed;

			this.physics.v[0] *= 0.8;

			var aid = this.animList[this.anim][this.standing];

			if (this.anim == 1)
				play = true;

			if (play) {
				jsEngine.modules.animation.playAnimation(aid);
			} else {
				jsEngine.modules.animation.stopAnimationAt(aid,2);
			}
	
			if (this.changeMind < jsEngine.pt && this.anim == 0) {
				this.changeMind = jsEngine.pt+Math.random()*7+1;
				this.speed = (Math.random()*4+2)*(Math.random()>0.5?1:-1);
				if (Math.random()>0.8)
					this.speed = 0;
			}
		}

		this.animName = Math.random()>0.5?"player":"player";

		this.animList = [
			[jsEngine.modules.animation.makeAnimation("assets/animation/"+this.animName+"/",true,true),
			jsEngine.modules.animation.makeAnimation("assets/animation/"+this.animName+"/",true,true)],
			[jsEngine.modules.animation.makeAnimation("assets/animation/"+this.animName+"-dying/",false,false),
			jsEngine.modules.animation.makeAnimation("assets/animation/"+this.animName+"-dying/",false,false)]
		];
		
		this.anim = 0;
		this.standing = 0;
		this.changeMind = jsEngine.pt+3;

		this.shot = function (d) {
			this.anim = 1;
			this.speed = 0;
			this.physics.v[0] = 50*d[0];
			//this.physics.p += 24;
			this.s[1] = 4;
		}

		this.render = function () {
			var aid = this.animList[this.anim][this.standing];
			var img1 = jsEngine.modules.animation.getAnimationImage1(aid);
			
			html5.context.save();
			html5.context.translate(this.physics.p[0]+img1.width/2,this.physics.p[1]+img1.height/2);

			if (this.dirs)
				html5.context.scale (1,1);
			else
				html5.context.scale (-1,1);

			html5.context.drawImage (img1,-img1.width/2,-img1.height/2);
			html5.context.restore();
		}

		this.getLines = function () {
			var lines = [];
			var vm = jsEngine.modules.math;

			var p = vm.copy (this.physics.p);
			var s = vm.copy (this.s);
			
			lines.push([p,vm.add(p, [s[0],0])]);
			lines.push([p,vm.add(p, [0,s[1]])]);
			lines.push([vm.add(p, [s[0],0]),vm.add(p,s)]);
			lines.push([vm.add(p, [0,s[1]]),vm.add(p,s)]);
			
			return lines;
		}

		var aid = this.animList[this.anim][this.standing];
		var img1 = jsEngine.modules.animation.getAnimationImage1(aid);
		this.s = [img1.width,img1.height];
	}
}