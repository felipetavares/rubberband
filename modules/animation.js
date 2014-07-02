/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

var AnimationPlaying = 1;
var AnimationStopped = 0;

function Frame () {
	this.time = 0.1; // How much time this frame stay in the screen
	this.imageName = ""; // html5.js image id
}

function Animation () {
	this.frames = []; // This is a list of frames
}

function AnimationInfo () {
	this.opacity		= null;
	this.currentFrame1   = null;
	this.currentFrame2   = null;
	this.currentFrameN  = 0;
	this.currentFrameT  = 0;
	this.currentFrameChangeT  = 0;
	this.aID = 0;

	this.state = AnimationPlaying;

	this.timeout = false;
}

function BitmapAnimation () {
	this.info = new JSInfo ("Moving Pixel",
							1.0,
							"Bitmap Animation Engine",
							"Controls all bitmap-based animations in the game");

	this.depends = ["math"];

	this.animations = []; // List of all bitmap animations in the game,
						  // Animations can be inserted with 'registerAnimation'
	this.animInfo   = [];

	this.makeAnimation = function (animPath, loop, rand) {
		var aID = this.animations.length;

		ainfo = this.initializeInfo (jsEngine.modules.assets.getAnimation(animPath),aID,rand);
		ainfo.loop = loop?true:false;
		this.animations.push(jsEngine.modules.assets.getAnimation(animPath));
		this.animInfo.push (ainfo);

		return aID;		
	}

	/*
		Returns a new 'AnimationInfo' structure containing
		the initial state of the animation anim, and with the
		animation ID 'aID'
	*/
	this.initializeInfo = function (anim,aID,rand) {
		var ainfo = new AnimationInfo();

		if (anim.frames.length > 0) {
			var fnum = 0;

			if (rand) {
				fnum = Math.floor (Math.random()*(anim.frames.length-1));
			}

			ainfo.currentFrame1 = html5.image(anim.frames[fnum].imageName);
			ainfo.currentFrame2 = html5.image(anim.frames[fnum].imageName);
			ainfo.currentFrameN = fnum;
			ainfo.currentFrameT = anim.frames[fnum].time;
			ainfo.currentFrameChangeT = 0;
			ainfo.state = AnimationStopped;
			ainfo.opacity = new this.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+ainfo.currentFrameT],[1,0]);
			//ainfo.timeout = setTimeout (html5.hitch2 (this.changeAnimationImage,this, [aID]), ainfo.currentFrameT*1000);
		}

		ainfo.aID = aID;

		return ainfo;
	}

	/*
		This function inserts a new animation in a vector of animations that are
		controlled by this class.
		It returns a animation ID that can be used in the future when acessing this
		particular animation.
	*/
	this.registerAnimation = function (anim) { // anim is of the type 'Animation'
		var aID = this.animations.length;

		ainfo = this.initializeInfo (anim,aID);
		
		this.animations.push(anim);
		this.animInfo.push (ainfo);

		return aID;
	}

	/*
		Returns the current image for a animation, needs a
		animation ID.
		It is important to note that this image changes over time.
	*/
	this.getAnimationImage1 = function (aID) { // aID is an animation id
		return this.animInfo[aID].currentFrame1;
	}

	this.getAnimationImage2 = function (aID) { // aID is an animation id
		return this.animInfo[aID].currentFrame2;
	}

	this.getAnimationOpacity = function (aID) { // aID is an animation id
		return this.animInfo[aID].opacity.interpolate(jsEngine.pt);
	}


	/*
		Stop an animation that is playing
	*/
	this.stopAnimation = function (aID) {
		this.animInfo[aID].state = AnimationStopped;
		//clearTimeout(this.animInfo[aID].timeout);
	}

	this.stopAnimationAt = function (aID, frame) {
		var anim = this.animations[aID];
		var ainfo = this.animInfo[aID];

		ainfo.currentFrameN = frame;
		ainfo.state = AnimationStopped;
		ainfo.currentFrame1 = html5.image(anim.frames[ainfo.currentFrameN].imageName);
		ainfo.currentFrame2 = html5.image(anim.frames[(ainfo.currentFrameN+1)%anim.frames.length].imageName);
		ainfo.currentFrameT = anim.frames[ainfo.currentFrameN].time;
		ainfo.opacity = new this.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+ainfo.currentFrameT],[1,0]);
		ainfo.currentFrameChangeT = ainfo.currentFrameT+jsEngine.pt;
		//clearTimeout(this.animInfo[aID].timeout);
		//this.changeAnimationImage (aID);
	}

	/*
		Starts an animation that is stopped
	*/
	this.playAnimation = function (aID) {
		if (this.animInfo[aID].state != AnimationPlaying) {
			this.animInfo[aID].state = AnimationPlaying;
			//clearTimeout(this.animInfo[aID].timeout);
			//this.changeAnimationImage (aID);
		}
	}

	/*
		This is an internal function that is used to change the current image
		for an animation. Needs an animation ID.
	*/
	this.changeAnimationImage = function (aID) {
		var anim = this.animations[aID];
		var ainfo = this.animInfo[aID];

		if (ainfo.state != AnimationPlaying)
			return;

		if (jsEngine.pt >= ainfo.currentFrameChangeT) {
			ainfo.currentFrameN++;
			if (ainfo.currentFrameN > anim.frames.length-1) {
				if (ainfo.loop)
					ainfo.currentFrameN = 0;
				else {
					ainfo.currentFrameN = anim.frames.length-1;
					ainfo.state = AnimationStopped;
				}
			}

			if (anim.frames.length > 0) {
				ainfo.currentFrame1 = html5.image(anim.frames[ainfo.currentFrameN].imageName);
				ainfo.currentFrame2 = html5.image(anim.frames[(ainfo.currentFrameN+1)%anim.frames.length].imageName);
				ainfo.currentFrameT = anim.frames[ainfo.currentFrameN].time;
				ainfo.opacity = new this.math.LinearInterpolator ([jsEngine.pt,jsEngine.pt+ainfo.currentFrameT],[1,0]);
				ainfo.currentFrameChangeT = ainfo.currentFrameT+jsEngine.pt;
			}
		}
	}

	this.step = function () {
		for (var a=0;a<this.animInfo.length;a++) {
			this.changeAnimationImage(a);
		}
	}
}