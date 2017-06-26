'use strict'

var gameCode;
var game;
var Game = {};
var width = 1024;
var height = 1024;
var unit = 64;
var player;
var opponent;
var playerSide;
var charWidth = 1.5;
var charHeight = 1.45;

function start(code, side) {
  gameCode = code;
  playerSide = side;
  // Setup canvas
  var bodyRef = document.body;
  bodyRef.innerHTML = '';
  game = new Phaser.Game(width, height, Phaser.AUTO, document.getElementById('game'));
  game.state.add('Game', Game);
  game.state.start('Game');
  Game.preload();
  Game.create();
}

Game.preload = function () {
  game.load.image('background', 'assets/water.png');
  game.load.image('topTile', 'assets/planet.png');
  game.load.image('bottomTile', 'assets/planetCenter.png');
  game.load.image('playerOneHUD', 'assets/hudPlayer_green.png');
  game.load.image('playerTwoHUD', 'assets/hudPlayer_pink.png')
  game.load.spritesheet('players', 'assets/spritesheet_players.png', 128, 256);
}

Game.create = function() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // Background/Ground
  var tiles = new Array();
  for(var times = 1; times <= Math.ceil(height / unit); ++times) {
    for(var i = 0; i < Math.ceil(width / unit); ++i) {
      if (times <= 3) {
        tiles.push(game.add.sprite(0, 0, 'bottomTile'));
      } else if (times == 4) {
        tiles.push(game.add.sprite(0, 0, 'topTile'));
      } else {
        tiles.push(game.add.sprite(0, 0, 'background'));
      }
      tiles[tiles.length - 1].width = unit;
      tiles[tiles.length - 1].height = unit;
      tiles[tiles.length - 1].x = i * unit;
      tiles[tiles.length - 1].y = height - (times * unit);
    }
  }
  // HUD
  var playerOneHUD = game.add.sprite(0, 0, 'playerOneHUD');
  var playerTwoHUD = game.add.sprite(0, 0, 'playerTwoHUD');
  playerOneHUD.x = unit;
  playerOneHUD.y = height / unit;
  playerTwoHUD.x = width - (3 * unit);
  playerTwoHUD.y = height / unit;
  // Players
  if (playerSide == 'left') {
    player = game.add.sprite(unit, height - (6.75 * unit), 'players');
    player.frame = 5;
    opponent = game.add.sprite(width - (3 * unit), height - (6.75 * unit), 'players');
    opponent.frame = 43;
  } else {
    player = game.add.sprite(width - (3 * unit), height - (6.75 * unit), 'players');
    player.frame = 43;
    opponent = game.add.sprite(unit, height - (6.75 * unit), 'players');
    opponent.frame = 5;
  }
  player.width /= charWidth;
  player.height /= charHeight;
  opponent.width /= charWidth;
  opponent.height /= charHeight;
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(opponent);
  socket.emit('attach', {gameCode: gameCode});
  }

Game.update = function() {
  var cursors = game.input.keyboard.createCursorKeys();
  player.body.velocity.x = 0;
  opponent.body.velocity.x = 0;
  if (cursors.left.isDown) {
    socket.emit('direct', {direction: 'left', side: playerSide});
  } else if (cursors.right.isDown) {
    socket.emit('direct', {direction: 'right', side: playerSide});
  } else if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -350;
  }

  socket.on('move', function(data) {
    if (data.side == playerSide) {
      player.body.velocity[data.direction] += data.amount;
    } else {
      opponent.body.velocity[data.direction] += data.amount;
    }
  });
}
