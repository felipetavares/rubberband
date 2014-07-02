/*
	O nome deste módulo é óbvio.. combo<->score...
*/

function ComboManager () {
	this.info = new JSInfo ("Hi-Score",
							0.1,
							"Combo Manager",
							"Controls hi-scoring of the game using hits to create combos");
	this.depends = ["hud","messages"];

	this.lastHitTime = jsEngine.pt;

	this.continuousPeriod = 2.2;

	this.hitNum = 0;

	this.score = 0;

	this.hit = function () {
		this.hitNum++;

		this.score += Math.pow(2,this.hitNum-1);
		jsEngine.modules.hud.updateText("score", ""+(this.score*100));

		if (this.hitNum > 1)
			jsEngine.modules.messages.addMessage (new Message("x"+this.hitNum));
		jsEngine.modules.messages.addMessage (new Message(""+(Math.pow(2,this.hitNum-1)*100)));

		this.lastHitTime = jsEngine.pt;
	}

	this.update = function () {
		if (jsEngine.pt-this.lastHitTime > this.continuousPeriod) {
			this.hitNum = 0;
		}
	}

	this.reset = function () {
		this.score = 0;
		this.hitNum = 0;
	}
}