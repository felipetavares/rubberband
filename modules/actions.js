/*
	Copyright (C) 2014 by Felipe Tavares
*/

/*
	The name for this module comes from the fact
	that when you put actions into the game, it 
	starts feeling "alive"
*/

function ActionController () {
	this.info = new JSInfo ("It is alive!",
							0.1,
							"Action Controller",
							"Controls interactions between player and objects");
	this.depends = ["assets"];

	this.actions = [];

	this.addAction = function (oname, aname, action) {
		if (!this.actions[oname])
			this.actions[oname] = [];
		this.actions[oname][aname] = action;
	}

	this.createObject = function (object) {
		if (object.image) {
			if (this.actions[object.image]) {
				for (var a in this.actions[object.image]) {
					object[a] = this.actions[object.image][a];
				}
			}
		}
	}
}