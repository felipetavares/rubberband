/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

/* JSEngine. Version Dead Wolf.
 * This version is named because of the Little Girl
 * game, for what it was written.
 */

function JSInfo (name,version,info,behavior) {
	// Things that need to be nefined in every JSEngine class
	this.name     = name;
	this.version  = version;
	this.info     = info;
	this.behavior = behavior;
}

var AssetAnimation = 0;
var AssetImage = 1;
var AssetAudio = 2;

function JSAsset (path, type, info) {
	this.path = path;
	this.type = type;
	this.info = info;
}

function JSEngine () {
	this.info = new  JSInfo ("Dead Wolf",
							 2.0,
							 "Main JSEngine class",
							 "Controls all functionality and subsystems in JSEngine.");

	// The list of loaded modules
	this.modules = {};
	//

	this.updateTime = 1/60;

	this.userCallbacks = [];

	this.assetList = [];

	// The list of modules names to be loaded
	this.moduleList = [];
	//

	this.consoleDown = false;

	this.filesLoaded = 0;

	this.resizeWindow = false;

	// Helper functions
	this.loadFile = function (list, position) {
		if (position >= list.length) {
			// Load modules
			var module;
			for (module in this.moduleList) {
				if (!this.modules[this.moduleList[module][0]]) {
					// This loads the module named 'module'
					this.loadModule (module);
				}
			}

			this.startupComplete();
			return;
		}

		this.filesLoaded++;
		var s = list.length;

		html5.context.fillStyle = "white";
		html5.context.fillRect (0,0,html5.canvas.width,html5.canvas.height);
		var msg = "Loading "+list[position][2];

		html5.context.font = "normal 30px serif";
		html5.context.fillStyle = "black";
		this.loadingTextSize = html5.context.measureText(msg).width;
		html5.context.fillText (msg,html5.canvas.width/2-html5.context.measureText(msg).width/2,html5.canvas.height/2);

		msg = "" + Math.floor((this.filesLoaded/s*100)) + "%";
		msg += " "+this.filesLoaded+"/"+s;

		html5.context.fillStyle = "gray";
		html5.context.fillRect (html5.canvas.width/2-this.loadingTextSize/2,html5.canvas.height/2+30,(this.loadingTextSize),5);
		html5.context.fillStyle = "black";
		html5.context.fillRect (html5.canvas.width/2-this.loadingTextSize/2,html5.canvas.height/2+30,this.filesLoaded/s *(this.loadingTextSize),5);
		html5.context.font = "normal 20px serif";
		html5.context.fillText (msg,html5.canvas.width/2-html5.context.measureText(msg).width/2,html5.canvas.height/2+65);


		var filename = list[position][2];
		var script = document.createElement ("script");
		script.type = "text/javascript";
		script.src = "modules/"+filename+"?version="+Math.random();

		var callback = html5.hitch2 (this.loadFile, this, [list,position+1]);

		script.onreadstatechange = callback;
		script.onload = callback;

		document.head.appendChild (script);
	}

	this.loadModule = function (moduleName) {
		this.log ("Loading " + this.moduleList[moduleName][0] + " ");
		
		if (!this.modules[this.moduleList[moduleName][0]]) {
			try {
				if (this.verifyDepends (moduleName)) { // Verify if deps are satisfied
					// Loads module 'moduleName'. Note that the module constructor don't have any parameters.
					eval ("this.modules['" + this.moduleList[moduleName][0] + "'] = new " + this.moduleList[moduleName][1] + " ();");
					this.putDepends(this.modules[this.moduleList[moduleName][0]]);
				} else
					throw "Dependencies not satisfied.";
			} catch (e) {
				this.log ("FAIL! : "+e);			
				this.log ("<br/>");			
				return false;
			}

			this.log ("OK! <br/>");
		} else {
			this.log ("ALREADY LOADED! <br/>");
		}

		return true;
	}

	this.putDepends = function (moduleInstance) {
		var dep;

		for (dep in moduleInstance.depends) {
			var moduleName = moduleInstance.depends[dep];

			if (!this.modules[moduleName])
				return false;
			else {
				moduleInstance[moduleName] = this.modules[moduleName];
			}
		}
	} 

	this.verifyDepends = function (moduleName) {
		var dep;
		
		var moduleInstance = eval ("new " + this.moduleList[moduleName][1] + "()");

		for (dep in moduleInstance.depends) {
			this.log ("Module " + this.moduleList[moduleName][0] + " depends on " + moduleInstance.depends[dep] + "<br/>");
			
			var i;
			for (i in this.moduleList) {
				if (this.moduleList[i][0] == moduleInstance.depends[dep])
					break;
			}

			if (!this.loadModule (i))
				return false;
		}

		return true;
	}
	//

	this.start = function () {
		$("#console").fadeTo(0,0.8);
		$("#console").slideUp(0);
		$("#console_entrance").keyup (function (evt) {
			if (evt.keyCode == 13) {
				try {
					jsEngine.log($("#console_entrance").val()+": "+eval ($("#console_entrance").val()) + "<br/>");
				} catch (e) {
					jsEngine.log ("Exception: "+e+"<br/>");
				}

				$("#console").scrollTop($("#console")[0].scrollHeight);
				$("#console_entrance").val("");
			}
		});

		this.log ("<br/>");
		this.log ("Starting up... <br/>");

		this.onWindowResize();

		// Loads the file needed for the module
		this.loadFile (this.moduleList, 0);
	}

	this.pt = new Date()/1000;
	// Delta time
	this.dt = 0;

	this.adjustImage = function () {
		html5.context.webkitImageSmoothingEnabled = false;
		html5.context.mozImageSmoothingEnabled = false;
	}

	this.smoothImage = function () {
		html5.context.webkitImageSmoothingEnabled = true;
		html5.context.mozImageSmoothingEnabled = true;
	}

	this.update = function () {
		this.dt = new Date()/1000-this.pt;
		this.pt = new Date()/1000;

		if (this.dt > 0.5)
			this.dt = 0;

		this.adjustImage();

		if (html5.keyboard[html5.keyESC]) {
			$("#console").slideToggle(250);
			$("#console").scrollTop($("#console")[0].scrollHeight);
			if (!this.consoleDown) {
				this.consoleDown = true;
				$("#console_entrance").focus();
			} else {
				this.consoleDown = false;
				$("#console_entrance").blur();				
			}

			html5.keyboard[html5.keyESC] = false;
		}

		this.modules.ui.update();

		this.userCallbacks['onGameUpdate']();
	}

	this.startupComplete = function () {
		this.onWindowResize();
		// Simple debug code
		this.log ("JSEngine "+this.info.name+": v"+this.info.version + "<br/>");
		this.log ("Available modules:" + "<br/>");

		var prop;
		for (prop in this.modules) {
			if (this.modules[prop].info) {
				this.log ("-> " + prop + " " + this.modules[prop].info.name + ": v" + this.modules[prop].info.version + "<br/>");
				if (this.modules[prop].start)
					this.modules[prop].start();
			}
		}		
	
		html5.onLoad = html5.hitch (function () {
			this.pt = new Date()/1000;
			this.userCallbacks['onGameStart']();
			this.interval = setInterval (html5.hitch (this.update,this), this.updateTime*1000);
		},this);
	}

	this.log = function (str) {
		document.getElementById("console_text").innerHTML += str;
	}

	this.onWindowResize = function () {
		if (!this.resizeWindow)
			return;

		$("html_canvas").css("width",$(window).width()+"px");
		$("html_canvas").css("height",$(window).height()+"px");
		html5.canvas.width = $(window).width();
		html5.canvas.height = $(window).height();
	}

	$(window).resize(html5.hitch(this.onWindowResize,this));
}

jsEngine = new JSEngine();