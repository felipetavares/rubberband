/*
	O nome deste módulo vem do estilo do texto utilizado
*/

function Message (text) {
	this.x = 5;
	this.y = html5.canvas.height/4;
	this.text = text;
	this.startingLife = 5;
	this.life = this.startingLife;

	this.startTime = jsEngine.pt;

	this.step = function () {
		this.life -= jsEngine.dt;
	}

	this.render = function () {		
		this.step();
		var time = (jsEngine.pt-this.startTime)+0.1;
		time = time > 1?1:time;

		if (!this.isAlive())
			return;

		html5.context.save();
			html5.context.globalAlpha = this.life/this.startingLife;
			html5.context.translate(this.x,this.y);
			html5.context.scale(1,1);
			html5.context.fillText (this.text,0,0);
		html5.context.restore();
	}

	this.isAlive = function () {
		return this.life > 0;
	}
}

function MessageManager () {
	this.info = new JSInfo ("Floating",
							0.1,
							"Message Manager",
							"Controls all messages displayed to the user");
	this.depends = [];

	this.messages = [];

	this.yp = 0;

	this.addMessage = function (message) {
		for (var m in this.messages)
			this.messages[m].y -= 20;
		this.messages.push (message);
	}

	this.render = function () {
		html5.context.fillStyle = "green";
		html5.context.textAlign = "left";
		html5.context.textBaseline = "middle";
		html5.context.font = 16+"px Lucida Console";

		for (var m=0;m<this.messages.length;m++) {
			if (this.messages[m].isAlive())
				this.messages[m].render();
			else {
				this.messages.splice(m,1);
				m--;
			}
		}
	}
}