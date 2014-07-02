/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

function UIListView (title) {
	this.title = title;
	this.list = null;
	this.panel = null;
	this.html = null;
	this.op = [];

	this.selectedOption = 0;

	this.hidden = true;

	this.constructor = function () {

	}

	this.addOption = function (op, onActivate, onSelect) {
		var html = $("<div>");
		html.attr ("class", "UIOption");
		html.text (op);

		if (onActivate) {
			html.click (onActivate);
		}

		this.op[op] = html;
		this.html.append (html);
	}

	this.hide = function () {
		this.hidden = true;
		window.removeEventListener('keydown',this.listener);
	}

	this.show = function () {
		this.hidden = false;

		this.html = $("<div>");
		this.html.attr ("class", "UIListView");

		var title = $("<div>");
		title.attr ("class", "UITitle");
		title.text (this.title);
		
		this.html.append (title);

		var op;
		for (op in this.list)
			this.addOption (this.list[op].content,
							html5.hitch(this.list[op].onActivate,this),
							html5.hitch(this.list[op].onSelect,this));
	
		this.select();

		this.listener = html5.hitch(this.onKeyDown,this);
	    window.addEventListener('keydown',this.listener);
	}

	this.unselect = function () {
		this.html.children().eq(1+this.selectedOption).attr ("class", "UIOption");
	}

	this.select = function () {
		this.html.children().eq(1+this.selectedOption).attr ("class", "UIOption-hover");
	}

	this.down = function () {
		this.unselect();
		if (this.selectedOption < this.list.length-1)
			this.selectedOption++;
		this.select();
	}

	this.up = function () {
		this.unselect();
		if (this.selectedOption > 0)
			this.selectedOption--;
		this.select();
	}

	this.onKeyDown = function (evt) {
		evt.preventDefault();

		if (this.hidden)
			return;

		if (evt.keyCode == html5.keyUp)
			this.up();
		if (evt.keyCode == html5.keyDown)
			this.down();
		if (evt.keyCode == html5.keyEnter) {
			this.html.children().eq(1+this.selectedOption).click(this.selectedOption);
		}
	}
}

function UIGraphListView (title) {
	this.title = title;
	this.list = null;
	this.panel = null;
	this.html = null;
	this.op = [];

	this.selectedOption = 0;

	this.hidden = true;

	this.constructor = function () {

	}

	this.addOption = function (op, width, onActivate, onSelect) {
		var html = $("<div>");
		html.attr ("class", "UIOption");

		var image = $("<img>");
		image.attr ("src", op);
		image.attr ("width", width);

		html.append(image);

		if (onActivate) {
			html.click (onActivate);
		}

		this.op[op] = html;
		this.html.append (html);
	}

	this.hide = function () {
		this.hidden = true;
		window.removeEventListener('keydown',this.listener);
	}

	this.show = function () {
		this.hidden = false;

		this.html = $("<div>");
		this.html.attr ("class", "UIGraphListView");

		var title = $("<div>");
		title.attr ("class", "UITitle");
		title.text (this.title);
		
		this.html.append (title);

		var op;
		for (op in this.list)
			this.addOption (this.list[op].content,
							this.list[op].width,
							html5.hitch(this.list[op].onActivate,this),
							html5.hitch(this.list[op].onSelect,this));
	
		this.select();

		this.listener = html5.hitch(this.onKeyDown,this);
	    window.addEventListener('keydown',this.listener);
	}

	this.unselect = function () {
		this.html.children().eq(1+this.selectedOption).attr ("class", "UIOption");
	}

	this.select = function () {
		this.html.children().eq(1+this.selectedOption).attr ("class", "UIOption-hover");
	}

	this.down = function () {
		this.unselect();
		if (this.selectedOption < this.list.length-1)
			this.selectedOption++;
		this.select();
	}

	this.up = function () {
		this.unselect();
		if (this.selectedOption > 0)
			this.selectedOption--;
		this.select();
	}

	this.onKeyDown = function (evt) {
		evt.preventDefault();

		if (this.hidden)
			return;

		if (evt.keyCode == html5.keyLeft)
			this.panel.hide();
		if (evt.keyCode == html5.keyUp)
			this.up();
		if (evt.keyCode == html5.keyDown)
			this.down();
		if (evt.keyCode == html5.keyEnter) {
			this.click = this.selectedOption;
			this.html.children().eq(1+this.selectedOption).click();
		}
	}
}

function UIPanel () {
	this.border = 0.1;
	this.backgroundColor = "rgba(0,0,0,1)";
	this.color = "rgba(0,255,255,1)";

	this.currentView = null;
	this.views = [];

	this.html = null;

	this.addView = function (view) {
		this.currentView = 0;
		view.panel = this;
		this.views.push (view);
	}

	this.open = function () {
		this.html = $("<div>");
		this.html.attr ("class", "UIPanel");
		$("body").append(this.html);
		this.html.css ("display", "none");
	}

	this.show = function () {
		var child = this.html.children().first();
		if (child.length == 0)
			child = this.html;

		this.views[this.currentView].constructor();
		this.views[this.currentView].show();		

		child.animate ({
			"left": 0
		},25,"swing", html5.hitch(function () {
		
		this.html.html("");
	
		this.html.append (this.views[this.currentView].html);
	
		var vw = this.html.width();
		var vh = this.html.height();

		this.html.css("left", ($(window).width()-vw)/2)
		this.html.css("top", ($(window).height()-vh)/2)
		this.html.css ("display", "block");
		},this));
	}

	this.switchTo = function (n) {
		if (n >= 0 &&
			n < this.views.length) {
			this.views[this.currentView].hide();
			this.currentView = n;
			this.show();
		}
	}

	this.hide = function () {
		this.views[this.currentView].hide();
		this.html.css ("display", "none");
		html5.enableInput();
	}
}

function UISelector (p, options, userData) {
	this.p = p;

	this.options = options;
	this.userData = userData;
	this.selectedOption = 0;

	this.isShow = false;
	this.closing = false;

	this.len = new jsEngine.modules.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt], [0, 0]);
	this.ang = new jsEngine.modules.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt], [0, 0]);

	this.getUserData = function () {
		return this.userData[this.selectedOption];
	}
	
	this.show = function () {
		this.isShow = true;
		this.len = new jsEngine.modules.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+0.3], [0, 50]);
	}

	this.hide = function () {
		this.closing = true;
		this.len = new jsEngine.modules.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+0.3], [50, 1],
																html5.hitch(this.realHide,this));
	}
	
	this.realHide = function () {
		this.isShow = false;
		this.closing = false;
	}
	
	this.render = function () {
		if (!this.isShow)
			return;

		if ((html5.keyboard[html5.keyRight] || html5.mouseWheel > 0) &&
			this.ang.complete(jsEngine.pt)) {
			html5.keyboard[html5.keyRight] = false;
			html5.mouseWheel = 0;
			if (this.selectedOption > 0)
				this.selectedOption--;
			else
				this.selectedOption = this.options.length-1;
			var sangle = Math.PI*2/this.options.length;
			this.ang = new jsEngine.modules.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+0.2], [-sangle, 0])
		}
		if ((html5.keyboard[html5.keyLeft] || html5.mouseWheel < 0) &&
			this.ang.complete(jsEngine.pt)) {
			html5.keyboard[html5.keyLeft] = false;
			html5.mouseWheel = 0;
			if (this.selectedOption < this.options.length-1)
				this.selectedOption++;
			else
				this.selectedOption = 0;
			var sangle = Math.PI*2/this.options.length;
			this.ang = new jsEngine.modules.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+0.2], [sangle, 0])
		}

		var o=null;
		for (;o != this.selectedOption; o = (o+1)%this.options.length) {
			if (o == null)
				o = this.selectedOption;

			var onum = o-this.selectedOption;

			html5.context.save();
				var rangle = onum/this.options.length*Math.PI*2+this.ang.interpolate(jsEngine.pt);
			
				html5.context.translate (this.p[0],this.p[1]);
				html5.context.rotate (rangle);
				html5.context.translate (0,-this.len.interpolate(jsEngine.pt));

				html5.context.rotate (-rangle);
				
				if (!onum) {
					html5.context.strokeStyle = "#0f0";
					html5.context.strokeRect (-9,-9,
											  18,18);
				}

				html5.context.scale(16/this.options[o].width,16/this.options[o].height);
				
				html5.context.drawImage (this.options[o],
										 -this.options[o].width/2,-this.options[o].height/2);
			html5.context.restore();
		}
	}
}

function UIManager () {
	this.info = new JSInfo ("Cick son, click",
							1.0,
							"UI Manager",
							"Draws and animates all GUI elements");
	this.depends = ["math"];

	this.panels = [];
	this.selectors = [];

	this.currentPanel = null;

	this.y = 0;

	this.start = function () {
	}

	this.show = function (panel) {
		this.currentPanel = panel;
		panel.show();
		//html5.disableInput();
	}

	this.update = function () {
		for (var s in this.selectors) {
			this.selectors[s].render();
		}
	}
}