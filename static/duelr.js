'use strict'

var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {antialias: false, transparent: false, resolution: 1});
var stage = new PIXI.Container();
var playerSide = null;
var unit = 64;
var charWidth = 1.5;
var charHeight = 1.45;
var playerOneNameHUD;
var playerTwoNameHUD;
var playerOne;
var playerTwo;

function start(side, nameP1, nameP2) {
  playerSide = side;
  playerOneNameHUD = nameP1;
  playerTwoNameHUD = nameP2;
  // Setup canvas
  var bodyRef = document.body;
  bodyRef.innerHTML = '';
  document.body.appendChild(renderer.view);
    // Load assets
  PIXI.loader
    .add([
      'assets/planet.png',
      'assets/planetCenter.png',
      'assets/water.png',
      'assets/hudPlayer_green.png',
      'assets/hudPlayer_pink.png',
      'assets/alienGreen_front.png',
      'assets/alienPink_front.png'
    ])
    .load(setup);
}

function setup() {
  // Ground/background
  var tile = new Array();
  for(var times = 1; times <= 3; ++times) {
    for(var i = 0; i < Math.ceil(window.innerWidth / unit); ++i) {
      tile.push(new PIXI.Sprite(PIXI.loader.resources['assets/planetCenter.png'].texture));
      tile[tile.length - 1].x = i*unit;
      tile[tile.length - 1].y = window.innerHeight-(times*unit);
      tile[tile.length - 1].width = unit;
      tile[tile.length - 1].height = unit;
      stage.addChild(tile[tile.length - 1]);
    }
  }
  for(var i = 0; i < Math.ceil(window.innerWidth / unit); ++i) {
    tile.push(new PIXI.Sprite(PIXI.loader.resources['assets/planet.png'].texture));
    tile[tile.length - 1].x = i*unit;
    tile[tile.length - 1].y = window.innerHeight-(4*unit);
    tile[tile.length - 1].width = unit;
    tile[tile.length - 1].height = unit;
    stage.addChild(tile[tile.length - 1]);
  }
  for(var times = 5; times <= Math.ceil(window.innerHeight / unit); ++times) {
    for(var i = 0; i < Math.ceil(window.innerWidth / unit); ++i) {
      tile.push(new PIXI.Sprite(PIXI.loader.resources['assets/water.png'].texture));
      tile[tile.length - 1].x = i*unit;
      tile[tile.length - 1].y = window.innerHeight-(times*unit);
      tile[tile.length - 1].width = unit;
      tile[tile.length - 1].height = unit;
      stage.addChild(tile[tile.length - 1]);
    }
  }
  // HUD
  var playerOneHUD = new PIXI.Sprite(PIXI.loader.resources['assets/hudPlayer_green.png'].texture);
  var playerTwoHUD = new PIXI.Sprite(PIXI.loader.resources['assets/hudPlayer_pink.png'].texture);
  playerOneHUD.x = unit;
  playerTwoHUD.x = window.innerWidth - 3*unit;
  playerOneHUD.y = window.innerHeight / unit;
  playerTwoHUD.y = window.innerHeight / unit;
  stage.addChild(playerOneHUD);
  stage.addChild(playerTwoHUD);
  var style = new PIXI.TextStyle({
    fontFamily: 'Racing Sans One',
    fontSize: 48,
    fill: ['#232526', '#414345'], // gradient
    stroke: '#ffffff',
  });
  var playerOneName = new PIXI.Text(playerOneNameHUD, style);
  var playerTwoName = new PIXI.Text(playerTwoNameHUD, style);
  // Find the appropriate width to offset Player Two's name by-----------------
  var canvas = document.createElement('canvas');
  var canvasP2 = canvas.getContext('2d');
  canvasP2.font = '48px Racing Sans One';
  var tempWidth = canvasP2.measureText(playerTwoNameHUD).width;
  //---------------------------------------------------------------------------
  playerOneName.x = playerOneHUD.x + 2*unit;
  playerTwoName.x = playerTwoHUD.x - tempWidth;
  playerOneName.y = playerOneHUD.y + unit/3;
  playerTwoName.y = playerTwoHUD.y + unit/3;
  stage.addChild(playerOneName);
  stage.addChild(playerTwoName);
  // Characters
  playerOne = new PIXI.Sprite(PIXI.loader.resources['assets/alienGreen_front.png'].texture);
  playerTwo = new PIXI.Sprite(PIXI.loader.resources['assets/alienPink_front.png'].texture);
  playerOne.width /= charWidth;
  playerTwo.width /= charWidth;
  playerOne.height /= charHeight;
  playerTwo.height /= charHeight;
  playerOne.x = unit;
  playerTwo.x = window.innerWidth - 3*unit;
  playerOne.y = window.innerHeight-6*unit;
  playerTwo.y = window.innerHeight-6*unit;
  if(playerSide == 'left') {
    stage.addChild(playerTwo);
    stage.addChild(playerOne);
  } else {
    stage.addChild(playerOne);
    stage.addChild(playerTwo);
  }
  renderer.render(stage);
  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  playerOne.x += 10;
  renderer.render(stage);
}
