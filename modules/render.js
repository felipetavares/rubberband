/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

var scnLogo = {
	"scene": function () {
		this.backgroundColor = "white";
		this.textColor = "black";
	},

	"renderer": function () {
		this.scene = null;
		this.s = 4;
		this.a = 4;

		this.startt = jsEngine.pt;

		this.render = function () {
			jsEngine.smoothImage();

			html5.context.fillStyle = this.scene.backgroundColor;
			html5.context.fillRect (0,0,html5.canvas.width,html5.canvas.height);

			var img = html5.image("assets/images/bazinga.logo.png");

			if (this.a*4*img.height > html5.canvas.height/2) {
				this.a -= jsEngine.dt;
				this.s = this.a;
			} else {
				var time = jsEngine.pt-this.startt;
				if (time > 5) {// Cinco segundos 
					//var nextRenderer = new scnIntro.renderer();
					//nextRenderer.scene = new scnIntro.scene();
					//jsEngine.modules.render.renderer = nextRenderer;
				}
			}

			html5.context.save();
				html5.context.translate (html5.canvas.width/2,html5.canvas.height/2);
				html5.context.scale (4*this.s,4*this.s);

				html5.context.drawImage (img,
										 -img.width/2,-img.height/2);
			html5.context.restore();
		}
	}
}

function Cloud (c) {
	this.image = html5.image(Math.random()>0.5?"assets/images/back/nocol/cloud.png":
											   "assets/images/back/nocol/cloud-large.png");
	this.p = [html5.canvas.width+this.image.width+c,Math.random()*html5.canvas.height/4+html5.canvas.height/2];
	this.v = Math.random()*6+2;

	this.render = function () {
		this.p[0] -= this.v * jsEngine.dt;
		html5.context.drawImage (this.image,this.p[0],this.p[1]);
	}
}

scnGame = {
	"scene": function () {
		this.backgroundColor = "white";
		this.textColor = [255,128,0];
		this.staticObjects = [];
		this.dynamicObjects = [];
		this.order = function () {
			this.staticObjects.sort (function (a,b) {
				return (a.physics.p[1]+a.height)-(b.physics.p[1]+b.height);
			});
		}

		this.exportJSON = function () {
			var data = JSON.stringify(this.staticObjects);
			$("#transfer").css("display","block");
			$("#transfer").focus();
			$("#transfer").val(data);
			$("#transfer").keyup(function (e) {
				if (e.keyCode != html5.keyC)
					return;
				$("#transfer").css("display","none");			
			});
		}

		this.doImport = function (data) {
			this.staticObjects = [];
			var object;
			
			try {
				object = JSON.parse(data);
			} catch (e) {
				alert (e);
			}

			for (var o in object) {
				var st = new jsEngine.modules.object.StaticObject(object[o].image,
																  object[o].w,
																  object[o].h,
																  object[o].physics.r!=false,
																  object[o].depth);
				st.physics.p[0] = object[o].physics.p[0];
				st.physics.p[1] = object[o].physics.p[1];

				this.staticObjects.push(st);
			}
		}

		this.realImport = function (evt) {
			if (evt.keyCode != html5.keyV)
				return;

			$("#transfer").css("display","none");			
			var data = $("#transfer").val();
			
			if (!data)
				return;
			
			this.doImport(data);			
		}
		
		this.importJSON = function () {
			$("#transfer").css("display","block");
			$("#transfer").focus();
			$("#transfer").html("");
			$("#transfer").keyup(html5.hitch(this.realImport, this));
		}
	},

	"renderer": function () {
		this.scene = null;
		// Quadtree related code
		//this.tree = new jsEngine.modules.quadtree.Quad([0,0],[800000,800000], 255);
		//this.query = new jsEngine.modules.quadtree.Quad([0,0],[html5.canvas.width,html5.canvas.height]);
		// Camera code
		this.cameraPosition = [0,0];
		this.dragStart = [0,0];
		this.cameraDrag = false;
		this.scale = [1,1];

		this.zoom = function () {
			if (this.scale[0] == 1 &&
				this.scale[1] == 1)
				this.scale = [2,2];
			else
				this.scale = [1,1];
		}

		this.start = function () {
			//this.scene.staticObjects.push(new jsEngine.modules.object.StaticObject("assets/images/wall/wall.png",32,32));
			this.scene.dynamicObjects.push(new jsEngine.modules.object.Player());
			for (var i=0;i<10;i++)
				this.scene.dynamicObjects.push(new jsEngine.modules.object.Person());
		}

		this.deleteStatic = function (object) {
			this.scene.staticObjects.splice(this.scene.staticObjects.indexOf(object),1);
		}

		this.bringFront = function (object) {
			var i = this.scene.staticObjects.indexOf(object);
			this.scene.staticObjects.splice(i,1);
			this.scene.staticObjects.push(object);
		}
		
		this.clouds = [];
		this.drawClouds = function () {
			if (this.clouds.length < 8)
				this.clouds.push(new Cloud(this.cameraPosition[0]));

			for (var i=0;i<this.clouds.length;i++) {
				this.clouds[i].render();
				if (this.clouds[i].p[0] < -this.clouds[i].image.width) {
					this.clouds.splice(i,1);
					i--;
				}
			}
		}

		this.rot = 0;

		this.render = function () {
			$("#html_canvas").css("background",this.scene.backgroundColor);
			html5.context.clearRect (0,0,html5.canvas.width,html5.canvas.height);

			if (!jsEngine.modules.drag.gridEnabled) {
				this.cameraPosition[0] = this.scene.dynamicObjects[0].physics.p[0]-html5.canvas.width/8;
				this.cameraPosition[1] = this.scene.dynamicObjects[0].physics.p[1]-html5.canvas.height/16*3;
			}

			// Frames Per Second		
			$("title").html(""+Math.floor(1/jsEngine.dt));

			if (!this.cameraDrag && html5.mouseButton && html5.keyboard[html5.keyCtrl]) {
				this.cameraDrag = true;
				this.dragStart = jsEngine.modules.math.add(html5.mousePos,this.cameraPosition);
			}

			if (!(html5.mouseButton && html5.keyboard[html5.keyCtrl])) {
				this.cameraDrag = false;
			}
			
			if (this.cameraDrag) {
				this.cameraPosition = jsEngine.modules.math.sub(this.dragStart, html5.mousePos);
			}
			
			html5.context.save();
			html5.context.scale(this.scale[0],this.scale[1]);
			html5.context.translate(-this.cameraPosition[0],-this.cameraPosition[1]);

			/*
			var k0 = [jsEngine.modules.math.add(html5.mousePos,this.cameraPosition),[0,70]];
			var k1 = [[-80,80],[80,80]];

			var p = jsEngine.modules.math.rayLineIntersection (k0,k1);
			html5.context.fillStyle = "red";
			html5.context.strokeStyle = "blue";
			html5.context.moveTo(k0[0][0],k0[0][1]);
			html5.context.lineTo(k0[1][0],k0[1][1]);
			html5.context.moveTo(k1[0][0],k1[0][1]);
			html5.context.lineTo(k1[1][0],k1[1][1]);
			html5.context.stroke();
			html5.context.fillRect(p[0],p[1],2,2);
			*/

			// Step static objects
			for (var s in this.scene.staticObjects) {
				this.scene.staticObjects[s].step();
			}

			for (var s=this.scene.staticObjects.length-1;s>=0;s--) {
				jsEngine.modules.drag.drag(this.scene.staticObjects[s]);
			}

			var r = true;
			// Draw static objects
			for (var s in this.scene.staticObjects) {
				this.scene.staticObjects[s].render();
				if (this.scene.staticObjects[s].image == "assets/images/back/nocol/sunset.png") {
					this.drawClouds();
				}
			}

			jsEngine.modules.decal.render();
			jsEngine.modules.particles.render();

			// Step dynamic objects
			for (var d in this.scene.dynamicObjects) {
				this.scene.dynamicObjects[d].step();
				jsEngine.modules.drag.drag(this.scene.dynamicObjects[d]);
			}

			// Draw dynamic objects
			for (var d=0;d<this.scene.dynamicObjects.length;d++) {
				this.scene.dynamicObjects[d].render();			
			}
			
			html5.context.restore();
		}
	}
}

function GameRender () {
	this.info = JSInfo ("Matrix",
						1.0,
						"Game Render",
						"Render the game, based in objects");
	this.depends = [];

	this.renderer = null;

	this.render = function () {
		this.renderer.render();
	}
}
