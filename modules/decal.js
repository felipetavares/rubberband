/*
	This module manages all types of decals
*/

function Decal (p, image) {
	this.p = p;
	this.image = image;
	this.cImage = html5.image(this.image);

	this.render = function () {
		html5.context.drawImage (this.cImage, this.p[0]-this.cImage.width/2,
											  this.p[1]-this.cImage.height/2);
	}
}

function DecalManager () {
	this.info = new JSInfo ("Decals",
							0.1,
							"Decal manager",
							"Controls decals");
	this.depends = [];

	this.decals = [];
	
	this.addDecal = function (decal) {
		this.decals.push (decal);
	}
	
	this.render = function () {
		for (var d=0 in this.decals) {
			this.decals[d].render();
		}
	}
}