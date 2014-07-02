/*
	O nome deste módulo vem do fato de ele ser uma idéia não necessária ao jogo
	ao qual estávamos implementando
*/

function HUD () {
	this.info = new JSInfo ("Spinoff",
							0.1,
							"HUD Manager",
							"Control simple scoring texts displayed on screen");
	this.depends = ["particles"];

	this.texts = [];

	this.addText = function (name, text, x, y) {
		this.texts[name] = [text,x,y];
	}

	this.updateText = function (name, text) {
		this.texts[name][0] = text;

		html5.context.textAlign = "left";
		html5.context.textBaseline = "top";
		html5.context.font = 32+"px sans-serif";
		var offset = html5.context.measureText (text).width/2;

		jsEngine.modules.particles.addSystem(new Explosion (this.texts[name][1]+offset,
															this.texts[name][2]+16,
															"#00a0ff",
															100));
	}

	this.getText = function (name) {
		return this.texts[name][0];
	}

	this.render = function () {
		html5.context.fillStyle = "orange";
		html5.context.textAlign = "left";
		html5.context.textBaseline = "top";
		html5.context.font = 32+"px sans-serif";

		for (var t in this.texts) {
			html5.context.fillText (this.texts[t][0], this.texts[t][1], this.texts[t][2]);
		}
	}

	this.reset = function () {
		this.texts = [];
	}
}