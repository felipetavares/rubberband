/*
	Copyright (C) 2012,2013 by Calango Rei Games, wich is:
	Felipe Tavares, Brenno Arruda, Vinicius Abdias, Mateus Medeiros and Giovanna Gorgônio
*/

/*
	The name of this module comes from a character that we were
	implementing, 'Brian', he was a assassin
*/

function CharacterController () {
	this.info = new JSInfo ("Assassin",
							0.1,
							"Character Controller",
							"Controls the animations and physics of a game character");
	this.depends = ["animation","physics"];
}