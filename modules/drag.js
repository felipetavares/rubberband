/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

/*
	Mouse dragging of on-screen objects, heavely used on the editor
*/

function DragInfo (mstartPos, ostartPos) {
	this.mp = jsEngine.modules.math.copy (mstartPos);
	this.op = jsEngine.modules.math.copy (ostartPos);
}

function DragManager () {
	this.info = new JSInfo ("Drag&Drop",
							0.1,
							"Drag manager",
							"Controls objects drag&dropping");
	this.depends = ["math","collision"];

	this.draggedInfo = null;
	this.dragged = null;

	this.gridSize = [4,4];
	this.gridEnabled = false;

	this.underMouse = function () {
		var allObjects = jsEngine.modules.render.renderer.scene.staticObjects;

		var underObjects = [];
		for (var o in allObjects) {
			if (this.isUnderMouse (allObjects[o]))
				underObjects.push (allObjects[o]);
		}
		
		return underObjects;
	}
	
	this.isUnderMouse = function (object) {
		var mousePoly = [
			[html5.mousePos[0],html5.mousePos[1]],
			[html5.mousePos[0]+2,html5.mousePos[1]+2],
			[html5.mousePos[0]-2,html5.mousePos[1]+2],
		];

		var dhull = this.math.msub(object.physics.hull(),
								   jsEngine.modules.render.renderer.cameraPosition);
		return this.collision.SAT(mousePoly,dhull)
	}
	
	this.drag = function (object) {
		if (this.dragged || html5.keyboard[html5.keyCtrl])
			return;

		var mousePoly = [
			[html5.mousePos[0],html5.mousePos[1]],
			[html5.mousePos[0]+2,html5.mousePos[1]+2],
			[html5.mousePos[0]-2,html5.mousePos[1]+2],
		];

		var dhull = this.math.msub(object.physics.hull(),
								   jsEngine.modules.render.renderer.cameraPosition);
		if (this.collision.SAT(mousePoly,dhull) &&
			html5.mouseButton) {
			this.dragged = object;
			this.draggedInfo = new DragInfo(html5.mousePos, object.physics.p);
		}
	}

	this.adjustToGrid = function (p) {
		if (this.gridEnabled) {
			p[0] = Math.floor(p[0]/this.gridSize[0]+0.5)*this.gridSize[0];
			p[1] = Math.floor(p[1]/this.gridSize[1]+0.5)*this.gridSize[1];
		}
		return p;
	}
	
	this.step = function () {
		var vm = this.math;

		if (this.dragged) {
			this.dragged.physics.p = vm.add(vm.sub(this.draggedInfo.op,this.draggedInfo.mp), html5.mousePos);
			if (!html5.mouseButton) {
				this.dragged.physics.p = this.adjustToGrid(this.dragged.physics.p);
				this.dragged = null;
			} 
		}
	
		if (html5.keyboard[html5.key1])
			this.gridSize = [4,4];
		if (html5.keyboard[html5.key2])
			this.gridSize = [8,8];
		if (html5.keyboard[html5.key3])
			this.gridSize = [16,16];
		if (html5.keyboard[html5.key4])
			this.gridSize = [32,32];
		if (html5.keyboard[html5.key5])
			this.gridSize = [64,64];
		if (html5.keyboard[html5.key6])
			this.gridSize = [128,128];
		if (html5.keyboard[html5.key7])
			this.gridSize = [256,256];
	}
	
	this.toggleGrid = function () {
		this.gridEnabled = !this.gridEnabled;
	}
	
	// Draw the grid
	this.render = function (selector) {
		if (this.gridEnabled) {
			var cam = jsEngine.modules.render.renderer.cameraPosition;
		
			html5.context.lineWidth = 1;

			for (var x=-cam[0]%this.gridSize[0];x<html5.canvas.width;x+=this.gridSize[0]) {
				html5.context.strokeStyle = "#000";
				html5.context.beginPath();
				html5.context.moveTo (x,0);
				html5.context.lineTo (x,html5.canvas.height);
				html5.context.stroke();
			}
			for (var y=-cam[1]%this.gridSize[1];y<html5.canvas.height;y+=this.gridSize[1]) {
				html5.context.strokeStyle = "#000";
				html5.context.beginPath();
				html5.context.moveTo (0,y);
				html5.context.lineTo (html5.canvas.width,y);
				html5.context.stroke();
			}
		}

		html5.context.globalAlpha = 0.5;
		html5.context.drawImage (html5.image(selector.getUserData()),html5.mousePos[0],html5.mousePos[1])
		html5.context.globalAlpha = 1;
	}
}