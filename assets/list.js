/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

jsEngine.assetList = [
	new JSAsset("assets/images/ui/trash.png",AssetImage,{ui: true}),
	new JSAsset("assets/images/ui/bring.front.png",AssetImage,{}),
	new JSAsset("assets/images/ui/x.png",AssetImage,{}),
	new JSAsset("assets/images/ui/layers.png",AssetImage,{ui: true}),
	new JSAsset("assets/images/floor/normal.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/culvert.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/stair.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/wall.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/glassdoor.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/neon.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/nocol/lamp.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/nocol/tree.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/nocol/backwall.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/nocol/stack.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/table0.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/chair0.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/lamp1.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/door.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/floor/door-open.png",AssetImage,{}),
	new JSAsset("assets/images/back/nocol/sit.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/back/nocol/mask.png",AssetImage,{}),
	new JSAsset("assets/images/back/nocol/sunset.png",AssetImage,{tile: true}),
	new JSAsset("assets/images/back/nocol/cloud.png",AssetImage,{}),
	new JSAsset("assets/images/back/nocol/cloud-large.png",AssetImage,{}),
	new JSAsset("assets/animation/player/",AssetAnimation,{framecount: 10, frametime: 0.08}),
	new JSAsset("assets/animation/player-dying/",AssetAnimation,{framecount: 12, frametime: 0.08}),
	new JSAsset("assets/animation/person0/",AssetAnimation,{framecount: 10, frametime: 0.08}),
	//new JSAsset("assets/animation/person0-dying/",AssetAnimation,{framecount: 10, frametime: 0.08}),
	new JSAsset("assets/animation/player-jump/",AssetAnimation,{framecount: 10, frametime: 0.05}),
	new JSAsset("assets/animation/player-shoting/",AssetAnimation,{framecount: 10, frametime: 0.05}),
	//new JSAsset("assets/audio/explosion.wav",AssetAudio,{}),
];

jsEngine.objectDepth = [];