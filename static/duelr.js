'use strict'

var gameCode;
var game;
var Game = {};
var width = 1024;
var height = window.innerHeight;
var unit = 64;
var floor;
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
  game = new Phaser.Game(width, height, Phaser.AUTO, '');
  game.state.add('Game', Game);
  game.state.start('Game');
  Game.preload();
  Game.create();
}

Game.preload = function () {
  game.load.image('background', 'assets/bgTile.png');
  game.load.image('topTile', 'assets/planet.png');
  game.load.image('bottomTile', 'assets/planetCentre.png');
  game.load.image('playerOneHUD', 'assets/hudPlayer_green.png');
  game.load.image('playerTwoHUD', 'assets/hudPlayer_beige.png')
  game.load.spritesheet('players', 'assets/spritesheet_players.png', 128, 256);
}

Game.create = function() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // Background/Ground
  floor = game.add.group();
  floor.enableBody = true;
  for(var times = 1; times <= Math.ceil(height / unit); ++times) {
    for(var i = 0; i < Math.ceil(width / unit); ++i) {
      if (times <= 3) {
        game.add.sprite(i * unit, height - (times * unit), 'bottomTile');
      } else if (times == 4) {
        var tile = floor.create(i * unit, height - (times * unit), 'topTile');
        tile.body.immovable = true;
      } else {
        game.add.sprite(i * unit, height - (times * unit), 'background');
      }
    }
  }
  // HUD
  var playerOneHUD = game.add.sprite(unit, (height / unit), 'playerOneHUD');
  var playerTwoHUD = game.add.sprite(width - (3 * unit), (height / unit), 'playerTwoHUD');
  // Players
  if (playerSide == 'left') {
    player = game.add.sprite(unit, height - (6.75 * unit), 'players');
    player.frame = 5;
    player.animations.add('right', [12, 20, 28, 36], 20);
    player.animations.add('left', [36, 28, 20, 12], 20);
    player.animations.add('up', [52])
    opponent = game.add.sprite(width - (3 * unit), height - (6.75 * unit), 'players');
    opponent.frame = 56;
    opponent.animations.add('right', [0, 8, 16, 24], 20);
    opponent.animations.add('left', [24, 16, 8, 0], 20);
    opponent.animations.add('up', [40]);
  } else {
    player = game.add.sprite(width - (3 * unit), height - (6.75 * unit), 'players');
    player.frame = 56;
    player.animations.add('right', [0, 8, 16, 24], 20)
    player.animations.add('left', [24, 16, 8, 0], 20);
    player.animations.add('up', [40]);
    opponent = game.add.sprite(unit, height - (6.75 * unit), 'players');
    opponent.frame = 5;
    opponent.animations.add('right', [12, 20, 28, 36], 20);
    opponent.animations.add('left', [36, 28, 20, 12], 20);
    opponent.animations.add('up', [52])
  }
  player.width /= charWidth;
  player.height /= charHeight;
  opponent.width /= charWidth;
  opponent.height /= charHeight;
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(opponent);
  player.body.collideWorldBounds = true;
  opponent.body.collideWorldBounds = true;
  player.body.gravity.y = 750;
  opponent.body.gravity.y = 750;
  socket.emit('attach', {gameCode: gameCode});
  }

Game.update = function() {
  game.physics.arcade.collide(player, floor);
  game.physics.arcade.collide(opponent, floor);
  player.body.velocity.x = 0;
  opponent.body.velocity.x = 0;
  var cursors = game.input.keyboard.createCursorKeys();
  if (cursors.left.isDown) {
    socket.emit('direct', {direction: 'left', side: playerSide});
  } else if (cursors.right.isDown) {
    socket.emit('direct', {direction: 'right', side: playerSide});
  } else if (cursors.up.isDown && player.body.touching.down) {
    socket.emit('direct', {direction: 'up', side: playerSide});
  }

  socket.on('move', function(data) {
    if (data.direction == 'x' && data.amount >= 0) {
      var direction = 'right';
    } else if (data.direction == 'x' && data.amount < 0){
      var direction = 'left';
    } else {
      var direction = 'up';
    }
    // ------------------------------------------------------------------------
    if (data.side == playerSide) {
      player.body.velocity[data.direction] = data.amount;
      player.animations.play(direction)
    } else {
      opponent.body.velocity[data.direction] = data.amount;
      opponent.animations.play(direction)
    }
  });
}
