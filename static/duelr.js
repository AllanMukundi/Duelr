'use strict'

var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {antialias: false, transparent: false, resolution: 1});
var stage = new PIXI.Container();
var playerSide = null;

function start(side) {
  playerSide = side;
  // Setup canvas
  var bodyRef = document.body;
  bodyRef.innerHTML = '';
  document.body.appendChild(renderer.view);
    // Load assets
  PIXI.loader
    .add([
      'assets/planet.png',
      'assets/planetCenter.png',
      'assets/water.png'
    ])
    .load(setup);
}

function setup() {
  // Renders the ground/background
  var tile = new Array();
  for(var times = 1; times <= 3; ++times) {
    for(var i = 0; i < Math.ceil(window.innerWidth / 64); ++i) {
      tile.push(new PIXI.Sprite(PIXI.loader.resources["assets/planetCenter.png"].texture));
      tile[tile.length - 1].x = i*64;
      tile[tile.length - 1].y = window.innerHeight-(times*64);
      tile[tile.length - 1].width = 64;
      tile[tile.length - 1].height = 64;
      stage.addChild(tile[tile.length - 1]);
    }
  }
  for(var i = 0; i < Math.ceil(window.innerWidth / 64); ++i) {
    tile.push(new PIXI.Sprite(PIXI.loader.resources["assets/planet.png"].texture));
    tile[tile.length - 1].x = i*64;
    tile[tile.length - 1].y = window.innerHeight-(4*64);
    tile[tile.length - 1].width = 64;
    tile[tile.length - 1].height = 64;
    stage.addChild(tile[tile.length - 1]);
  }
  for(var times = 5; times <= Math.ceil(window.innerHeight / 64); ++times) {
    for(var i = 0; i < Math.ceil(window.innerWidth / 64); ++i) {
      tile.push(new PIXI.Sprite(PIXI.loader.resources["assets/water.png"].texture));
      tile[tile.length - 1].x = i*64;
      tile[tile.length - 1].y = window.innerHeight-(times*64);
      tile[tile.length - 1].width = 64;
      tile[tile.length - 1].height = 64;
      stage.addChild(tile[tile.length - 1]);
    }
  }
  renderer.render(stage);
}
