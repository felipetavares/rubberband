/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

/*
	Esse módulo impĺementa um gerenciador de mapas.
*/

function DefaultObject () {
	this.move = function (map, x, y) {
		if (map.isInside(x,y)) {
			for (var i=0;i<map.data[this.y][this.x].length;i++)
				if (map.data[this.y][this.x][i] == this) {
					map.data[this.y][this.x].splice(i,1);
					break;
				}
		
			this.ix = new jsEngine.modules.math.LinearInterpolator (
							[jsEngine.pt,jsEngine.pt+0.2],
							[this.x,x]);
			this.iy = new jsEngine.modules.math.LinearInterpolator (
							[jsEngine.pt,jsEngine.pt+0.2],
							[this.y,y]);

			this.x = x;
			this.y = y;
		
			map.data[y][x].push(this);
		}
	}
}

// Tales
function Tales (x, y) {
	this.x = x;
	this.y = y;
	this.type = "tales";
	this.images = [
					html5.image("assets/images/tales/front.png"),
					html5.image("assets/images/tales/back.png"),
					html5.image("assets/images/tales/left.png"),
					html5.image("assets/images/tales/right.png"),
	];
	this.image = 0;

	this.ix = new jsEngine.modules.math.LinearInterpolator (
					[jsEngine.pt,jsEngine.pt],
					[this.x,this.x]);
	this.iy = new jsEngine.modules.math.LinearInterpolator (
					[jsEngine.pt,jsEngine.pt],
					[this.y,this.y]);

	// Just javascript, my dear..
	this.canMoveTo = new Player().canMoveTo;
	this.move = new Player().move;

	this.lastUpdate = jsEngine.pt;
	this.lastFrogUpdate = jsEngine.pt;

	this.bombIn = function (map, x, y) {
		if (map.isInside(x,y)) {
			for (var i=0;i<map.data[y][x].length;i++)
				if (map.data[y][x][i].type == "bomb")
					return true;
		}
		return false;
	}

	// Um pouco de inteligência para o nosso tales..
	this.bombNear = function (map, x, y) {
		return this.bombIn(map, x, y) 	||
			   this.bombIn(map, x+1, y) ||
			   this.bombIn(map, x-1, y)	||
			   this.bombIn(map, x, y+1)	||
			   this.bombIn(map, x, y-1);
	}

	this.calcNext = function (nextX,nextY) {
		var random = Math.random();

		if (random < 0.25) {
			nextY = nextY+1;
			this.image = 0;
		} else
		if (random < 0.50) {
			nextX = nextX+1;
			this.image = 3;
		} else
		if (random < 0.75) {
			nextY = nextY-1;
			this.image = 1;
		} else {
			nextX = nextX-1;
			this.image = 2;
		}
	
		return [nextX,nextY];
	}

	this.calcNextPlayer = function (nextX,nextY, player) {
		var dX = (nextX-player.x);
		var dY = (nextY-player.y);
		dX = dX>0?-1:dX<0?1:0;
		dY = dY>0?-1:dY<0?1:0;
	
		if (Math.abs(dX) > 0)
			this.image = dX>0?3:2;
		if (Math.abs(dY) > 0)
			this.image = dY>0?0:1;

		nextX += dX;
		nextY += dY;

		return [nextX,nextY];
	}

	this.update = function (map, player) {
		if (jsEngine.pt-this.lastUpdate > 0.3) {
			var nextX=this.x,nextY=this.y;

			var ret = this.calcNextPlayer(nextX,nextY,player);
			nextX = ret[0];
			nextY = ret[1];

			if (this.bombNear(map, nextX, nextY)) {
				nextX=this.x;
				nextY=this.y;
				var ret = this.calcNext(nextX,nextY);
				nextX = ret[0];
				nextY = ret[1];
			}

			this.move (map, nextX, nextY);

			this.lastUpdate = jsEngine.pt;
		}

		if (jsEngine.pt-this.lastFrogUpdate > 3) {
			map.data[this.y][this.x].push(new Frog(this.x,this.y));
			this.lastFrogUpdate = jsEngine.pt;
		}
	}

	this.render = function (map) {
		html5.context.drawImage (this.images[this.image],
								map.sx+this.ix.interpolate(jsEngine.pt)*map.ts,
								map.sy+this.iy.interpolate(jsEngine.pt)*map.ts);
	}
}

// Tile de parede
function Wall (x, y) {
	this.x = x;
	this.y = y;
	this.type = "wall";
	this.color = "rgb(255,128,64)";
	this.image = html5.image("assets/images/wall/wall.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
		html5.context.drawImage (this.image,
								map.sx+this.x*map.ts,
								map.sy+this.y*map.ts);
	}
}

// Tile da pia
function Sink (x, y) {
	this.x = x;
	this.y = y;
	this.type = "wall";
	this.color = "rgb(255,255,255)";
	this.image = html5.image("assets/images/objects/sink.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
		html5.context.drawImage (this.image,
								map.sx+this.x*map.ts,
								map.sy+this.y*map.ts);
	}
}

// Tile de parede de vidro
function Glass (x, y) {
	this.x = x;
	this.y = y;
	this.type = "wall";
	this.color = "rgb(0,200,255)";
	this.image = html5.image("assets/images/wall/glass.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
		html5.context.drawImage (this.image,
								map.sx+this.x*map.ts,
								map.sy+this.y*map.ts);
	}
}

// Tile de uma mesa
function Table (x, y) {
	this.x = x;
	this.y = y;
	this.type = "wall";
	this.color = "rgb(0,210,0)";
	this.image = html5.image("assets/images/objects/table.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
		html5.context.drawImage (this.image,
								map.sx+this.x*map.ts,
								map.sy+this.y*map.ts);
	}
}

// Tile de parede metálica
function MetalWall (x, y) {
	this.x = x;
	this.y = y;
	this.type = "metalwall";
	this.image = html5.image("assets/images/wall/metal.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
		html5.context.drawImage (this.image,
								map.sx+this.x*map.ts,
								map.sy+this.y*map.ts);
	}
}

// Tile de piso
function Floor (x, y) {
	this.x = x;
	this.y = y;
	this.type = "floor";
	this.image = html5.image("assets/images/floor/floor.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
	}
}

// Tile de grama
function Grass (x, y) {
	this.x = x;
	this.y = y;
	this.type = "floor";
	this.image = html5.image("assets/images/floor/grass.png");

	// Herança
	this.move = new DefaultObject().move;

	this.update = function (map) {

	} 

	this.render = function (map) {
	}
}

// Bomba
function Bomb (x, y) {
	this.x = x;
	this.y = y;
	this.type = "bomb";
	this.image = html5.image("assets/images/bomb/bomb.png");

	// Herança
	this.move = new DefaultObject().move;

	this.startTime = jsEngine.pt;

	this.update = function (map) {
		if (jsEngine.pt-this.startTime > 2) {
			this.explode(map);
		}
	}

	this.explode = function (map) {
		if (Settings.sound)
			html5.audio("assets/audio/explosion.wav").cloneNode(true).play();

		this.explodeTile(map,this.x,this.y);
		for (var d=1;d<2;d++) {
			this.explodeTile(map,this.x+d,this.y);
			this.explodeTile(map,this.x-d,this.y);
			this.explodeTile(map,this.x,this.y+d);
			this.explodeTile(map,this.x,this.y-d);
		}
	}

	this.explodeTile = function (map, x, y) {
		if (map.isInside(x,y)) {
			var explode = true;
			
			for (var i=0;i<map.data[y][x].length;i++) {
				if (map.data[y][x][i].type == "metalwall") {
					explode=false;
				}

				if (map.data[y][x][i].type == "player") {
					map.data[y][x][i].die();
				} else
				if (map.data[y][x][i] == this ||
					map.data[y][x][i].type == "wall" ||
					map.data[y][x][i].type == "tales" ) {
					if (map.data[y][x][i] != this)
						jsEngine.modules.combo.hit();
					if (map.data[y][x][i].type == "tales") {
						map.tales = null;
					} else {
						if (map.data[y][x][i].type == "wall") {
							jsEngine.modules.particles.addSystem(new Explosion(map.sx+x*map.ts+map.ts/2,
																	   map.sy+y*map.ts+map.ts/2,
																	   map.data[y][x][i].color,20));
							explode = false;
						}
					}
					map.data[y][x].splice(i,1);
					i--;
				}
				else
				if (map.data[y][x][i].type == "bomb") {
					map.data[y][x][i].explode(map);
				}
			}

			if (explode)
				jsEngine.modules.particles.addSystem(new Explosion(map.sx+x*map.ts+map.ts/2,
															   map.sy+y*map.ts+map.ts/2,
															   "red",20));
		}
	}

	this.render = function (map) {
		html5.context.drawImage (this.image,map.sx+this.x*map.ts,
											map.sy+this.y*map.ts);
	}
}

// Explosive Frog
function Frog (x, y) {
	this.x = x;
	this.y = y;
	this.type = "bomb";
	this.image = html5.image("assets/images/tales/frog.png");

	this.ix = new jsEngine.modules.math.LinearInterpolator (
					[jsEngine.pt,jsEngine.pt],
					[this.x,this.x]);
	this.iy = new jsEngine.modules.math.LinearInterpolator (
					[jsEngine.pt,jsEngine.pt],
					[this.y,this.y]);

	// Herança
	this.move = new DefaultObject().move;

	this.lastUpdateTime = jsEngine.pt;

	this.calcNext = function (nextX,nextY) {
		var random = Math.random();

		if (random < 0.25) {
			nextY = nextY+1;
		} else
		if (random < 0.50) {
			nextX = nextX+1;
		} else
		if (random < 0.75) {
			nextY = nextY-1;
		} else {
			nextX = nextX-1;
		}
	
		return [nextX,nextY];
	}

	this.update = function (map) {
		if (jsEngine.pt-this.lastUpdateTime > 0.3) {
			var nextX=this.x,nextY=this.y;

			var ret = this.calcNext(nextX,nextY);
			nextX = ret[0];
			nextY = ret[1];
			this.move (map, nextX, nextY);
		
			for (var i=0;i<map.data[this.y][this.x].length;i++) {
				if (map.data[this.y][this.x][i].type == "wall" ||
				    map.data[this.y][this.x][i].type == "metalwall" ||
				    map.data[this.y][this.x][i].type == "player") {
					this.explode(map);
				}
			}

			this.lastUpdateTime = jsEngine.pt;
		}
	}

	this.explode = new Bomb().explode;

	this.explodeTile = function (map, x, y) {
		if (map.isInside(x,y)) {
			var explode = true;
			
			for (var i=0;i<map.data[y][x].length;i++) {
				if (map.data[y][x][i].type == "metalwall") {
					explode=false;
				}

				if (map.data[y][x][i].type == "player") {
					map.data[y][x][i].die();
				} else
				if (map.data[y][x][i] == this ||
					map.data[y][x][i].type == "wall") {
					map.data[y][x].splice(i,1);
					i--;
				}
				else
				if (map.data[y][x][i].type == "bomb") {
					map.data[y][x][i].explode(map);
				}
			}

			if (explode)
				jsEngine.modules.particles.addSystem(new Explosion(map.sx+x*map.ts+map.ts/2,
															   map.sy+y*map.ts+map.ts/2,
															   "orange",20));
		}
	}

	this.render = function (map) {
		html5.context.drawImage (this.image,map.sx+this.ix.interpolate(jsEngine.pt)*map.ts,
											map.sy+this.iy.interpolate(jsEngine.pt)*map.ts);
	}
}

// Tile de jogador
function Player (x, y) {
	this.images = [
					html5.image("assets/images/player/front.png"),
					html5.image("assets/images/player/back.png"),
					html5.image("assets/images/player/left.png"),
					html5.image("assets/images/player/right.png"),
					html5.image("assets/images/player/life.png")
	];
	this.image = 0;

	this.type = "player";
	this.x = x;
	this.y = y;
	this.lives = 3;

	this.ix = new jsEngine.modules.math.LinearInterpolator (
					[jsEngine.pt,jsEngine.pt],
					[this.x,this.x]);
	this.iy = new jsEngine.modules.math.LinearInterpolator (
					[jsEngine.pt,jsEngine.pt],
					[this.y,this.y]);

	this.die = function () {
		this.lives --;
		if (this.lives == 0) { // Aqui morre mesmo
			jsEngine.modules.ui.show(GameMenu);
			if (localStorage.ha) {
				var myScore = parseInt(jsEngine.modules.hud.getText("score"));
				if (myScore > localStorage.ha)
					localStorage.ha = myScore;
				else
				if (myScore > localStorage.hb)
					localStorage.hb = myScore;
				else
				if (myScore > localStorage.hc)
					localStorage.hc = myScore;

			} else {
				localStorage.ha = 0;
				localStorage.hb = 0;
				localStorage.hc = 0;
			}
		}
	}

	this.canMoveTo = function (map, x, y) {
		for (var i=0;i<map.data[y][x].length;i++)
			if (map.data[y][x][i].type == "wall" ||
				map.data[y][x][i].type == "metalwall" ||
				map.data[y][x][i].type == "bomb")
				return false;
		return true;
	}

	this.move = function (map, x, y) {
		if (map.isInside(x,y)) {
			if (this.canMoveTo(map, x, y)) {
				for (var i=0;i<map.data[this.y][this.x].length;i++)
					if (map.data[this.y][this.x][i] == this) {
						map.data[this.y][this.x].splice(i,1);
						break;
					}
			
				this.ix = new jsEngine.modules.math.LinearInterpolator (
								[jsEngine.pt,jsEngine.pt+0.2],
								[this.x,x]);
				this.iy = new jsEngine.modules.math.LinearInterpolator (
								[jsEngine.pt,jsEngine.pt+0.2],
								[this.y,y]);

				this.x = x;
				this.y = y;
			
				map.data[y][x].push(this);
			}
		}
	}

	this.mouseUp = function () {
		if (html5.mouseButton &&
			html5.mousePos[1] < html5.canvas.height/4 &&
			html5.mousePos[0] > html5.canvas.width/4 &&
			html5.mousePos[0] < 3*html5.canvas.width/4)
			return true;
		return false;
	}

	this.mouseDown = function () {
		if (html5.mouseButton &&
			html5.mousePos[1] > 3*html5.canvas.height/4 &&
			html5.mousePos[0] > html5.canvas.width/4 &&
			html5.mousePos[0] < 3*html5.canvas.width/4)
			return true;
		return false;
	}

	this.mouseLeft = function () {
		if (html5.mouseButton &&
			html5.mousePos[0] < html5.canvas.width/4 &&
			html5.mousePos[1] > html5.canvas.height/4 &&
			html5.mousePos[1] < 3*html5.canvas.height/4)
			return true;
		return false;
	}

	this.mouseRight = function () {
		if (html5.mouseButton &&
			html5.mousePos[0] > 3*html5.canvas.width/4 &&
			html5.mousePos[1] > html5.canvas.height/4 &&
			html5.mousePos[1] < 3*html5.canvas.height/4)
			return true;
		return false;
	}

	this.mouseCenter = function () {
		if (html5.mouseButton &&
			html5.mousePos[0] > html5.canvas.width/4 &&
			html5.mousePos[0] < 3*html5.canvas.width/4 &&
			html5.mousePos[1] > html5.canvas.height/4 &&
			html5.mousePos[1] < 3*html5.canvas.height/4)
			return true;
		return false;		
	}

	this.lastUpdate = jsEngine.pt;
	this.lastBombUpdate = jsEngine.pt;

	this.update = function (map) {
		if (this.ix.complete(jsEngine.pt) &&
			this.iy.complete(jsEngine.pt)) {
			if (html5.keyboard[html5.keyUp] || this.mouseUp()) {
				this.move(map,this.x,this.y-1);
				this.image = 1;
			}
			if (html5.keyboard[html5.keyDown] || this.mouseDown()) {
				this.move(map,this.x,this.y+1);
				this.image = 0;
			}
			if (html5.keyboard[html5.keyLeft] || this.mouseLeft()) {
				this.move(map,this.x-1,this.y);
				this.image = 2;
			}
			if (html5.keyboard[html5.keyRight] || this.mouseRight()) {
				this.move(map,this.x+1,this.y);
				this.image = 3;
			}

			this.lastUpdate = jsEngine.pt;
		}

		if (html5.keyboard[html5.keySpace] || this.mouseCenter())
			if (jsEngine.pt-this.lastBombUpdate > 0.2) {
				map.data[this.y][this.x].push(new Bomb(this.x, this.y));
				this.lastBombUpdate = jsEngine.pt;
			}
	} 

	this.render = function (map) {
		html5.context.drawImage (this.images[this.image],map.sx+this.ix.interpolate(jsEngine.pt)*map.ts,
														 map.sy+this.iy.interpolate(jsEngine.pt)*map.ts);

		for (var l=0;l<this.lives;l++) {
			html5.context.fillStyle = "blue";
			html5.context.drawImage (this.images[4],html5.canvas.width-(l+1)*40,
												    html5.canvas.height-40);
		}
	}
}

// Comprimento, altura, tamanho dos tiles, descrição em uma array
function TileMap (w,h,ts, mapData, mapName) {
	this.sx = 0;
	this.sy = 0;

	this.w = w;
	this.h = h;
	this.ts = ts;
	this.data = [];

	this.floorPattern = html5.context.createPattern (new Floor().image, "repeat");

	this.player = null;

	this.startTime = null;
	this.messageNumber = 0;

	this.render = function () {
		if (jsEngine.pt-this.startTime < 1) {
			return;
		} else
		if (jsEngine.pt-this.startTime < 2) {
			if (this.messageNumber < 1) {
				this.messageNumber++;
				jsEngine.modules.messages.addMessage(new Message("3..."));
			}
			return;
		} else
		if (jsEngine.pt-this.startTime < 3) {
			if (this.messageNumber < 2) {
				this.messageNumber++;
				jsEngine.modules.messages.addMessage(new Message("2..."));
			}
			return;
		} else
		if (jsEngine.pt-this.startTime < 4) {
			if (this.messageNumber < 3) {
				this.messageNumber++;
				jsEngine.modules.messages.addMessage(new Message("1..."));
			}
			return;
		} else
		if (jsEngine.pt-this.startTime < 5) {
			if (this.messageNumber < 4) {
				this.messageNumber++;
				jsEngine.modules.messages.addMessage(new Message("Go! Go! Go!"));
			}
			return;
		} else {}

		this.sx = (html5.canvas.width-this.w*this.ts)/2+jsEngine.modules.particles.moveMap().x;
		this.sy = (html5.canvas.height-this.h*this.ts)/2+jsEngine.modules.particles.moveMap().y;

		// Coloca um flag avisando que ninguém foi atualizado
		for (var y=0;y<h;y++) {
			for (var x=0;x<w;x++) {
				for (var z=0;z<this.data[y][x].length;z++) {
					this.data[y][x][z].updated = false;
				}
			}
		}

		var layers = [[],[],[],[],[]];

		// Chama o update de todos os objetos
		for (var y=0;y<h;y++) {
			for (var x=0;x<w;x++) {
				for (var z=0;z<this.data[y][x].length;z++) {
					var object = this.data[y][x][z];
					switch (this.data[y][x][z].type) {
						case "player":
							layers[4].push(object);
						break;
						case "tales":
							layers[3].push(object);
						break;
						case "bomb":
							layers[2].push(object);
						break;
						case "wall":
							layers[1].push(object);
						break;
						default:
							layers[0].push(object);
					}
					if (!this.data[y][x][z].updated) {
						this.data[y][x][z].updated = true;
						this.data[y][x][z].update(this, this.player);
					}
				}
			}
		}

		if (layers[1].length == 0 && layers[3].length == 0) {
			jsEngine.modules.map.nextMap();
		}

		html5.context.fillStyle = this.floorPattern;
		html5.context.save();
			html5.context.translate (this.sx, this.sy);
			html5.context.fillRect (0, 0, this.w*this.ts, this.h*this.ts);
		html5.context.restore();

		for (var l=0;l<layers.length;l++) {
			for (var o=0;o<layers[l].length;o++) {
				layers[l][o].render(this);
			}
		}
	}

	this.start = function () {
		this.startTime = jsEngine.pt;
	}

	this.isInside = function (x, y) {
		if (x >= 0 && x < w &&
			y >= 0 && y < h)
			return true;
		return false;
	}

	//@construct
	for (var y=0;y<h;y++) {
		this.data[y] = [];
		for (var x=0;x<w;x++) {
			this.data[y][x] = [];
		}
	}

	for (var y=0;y<h;y++) {
		for (var x=0;x<w;x++) {
			this.data[y][x].push(new Floor(x,y));

			switch (mapData[y][x]) {
				case 'X':
					this.data[y][x].push(new Wall(x,y));
				break;
				case 'V':
					this.data[y][x].push(new Glass(x,y));
				break;
				case '@':
					this.player = new Player(x,y);
					this.data[y][x].push(this.player);
				break;
				case 'T':
					this.data[y][x].push(new Tales(x,y));
				break;
				case 'M':
					this.data[y][x].push(new Table(x,y));
				break;
				case 'P':
					this.data[y][x].push(new Sink(x,y));
				break;
				case '#':
					this.data[y][x].push(new MetalWall(x,y));
				break;
			}
		}
	}

	this.name = mapName;
}

function MapManager () {
	this.info = new JSInfo ("Arenas",
							0.1,
							"Tile Map",
							"Creates a map where objects can move freely");
	this.depends = ["math"];

	this.currentMapName = null;
	this.maps = [];
	this.sequence = [];
	this.mapNumber = 0;

	this.setSequence = function (sequence) {
		this.sequence = sequence;
	}

	this.addMap = function (name, map) {
		this.maps[name] = map;
		if (!this.currentMapName)
			this.currentMapName = name;
	}

	this.setCurrentMap = function (name) {
		this.currentMapName = name;
	}

	this.nextMap = function () {
		if (this.mapNumber < this.sequence.length) {	
			jsEngine.modules.particles.reset();
			this.currentMapName = this.sequence[this.mapNumber++];
			jsEngine.modules.messages.addMessage(new Message(this.maps[this.currentMapName].name));
			this.maps[this.currentMapName].start();
		} else {
			jsEngine.modules.particles.reset();
			jsEngine.modules.hud.reset();
			var gameRenderer = new scnFinal.renderer();
			gameRenderer.scene = new scnFinal.scene();

			jsEngine.modules.render.renderer = gameRenderer;
		}
	}

	this.render = function () {
		if (this.maps[this.currentMapName])
			this.maps[this.currentMapName].render();
	}

	this.reset = function () {
		this.maps = [];
		this.currentMapName = null;
		this.mapNumber = 0;
	}
}
