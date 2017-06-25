'use strict'

var game;
var Game = {};
var width = window.innerWidth;
var height = window.innerHeight;
var playerSide = null;
var unit = 64;
var charWidth = 1.5;
var charHeight = 1.45;

function start(side, nameP1, nameP2) {
  // Setup canvas
  var bodyRef = document.body;
  bodyRef.innerHTML = '';
  game = new Phaser.Game(width, height, Phaser.AUTO, document.getElementById('game'));
  game.state.add('Game', Game);
  game.state.start('Game');
}

Game.init = function() {
  game.stage.disableVisibilityChange = true;
}
