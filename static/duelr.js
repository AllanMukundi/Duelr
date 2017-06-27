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
  game.load.image('playerTwoHUD', 'assets/hudPlayer_pink.png');
  game.load.spritesheet('players', 'assets/sprites.png', 128, 256);
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
    player.animations.add('right', [20, 36, 52, 68], 10);
    player.animations.add('left', [27, 43, 59, 75], 10);
    player.animations.add('up', [100])
    opponent = game.add.sprite(width - (3 * unit), height - (6.75 * unit), 'players');
    opponent.frame = 83;
    opponent.animations.add('right', [98, 114, 3, 19], 10);
    opponent.animations.add('left', [109, 125, 12, 28], 10);
    opponent.animations.add('up', [105]);
  } else {
    player = game.add.sprite(width - (3 * unit), height - (6.75 * unit), 'players');
    player.frame = 83;
    player.animations.add('right', [98, 114, 3, 19], 10)
    player.animations.add('left', [109, 125, 12, 28], 10);
    player.animations.add('up', [105]);
    opponent = game.add.sprite(unit, height - (6.75 * unit), 'players');
    opponent.frame = 5;
    opponent.animations.add('right', [20, 36, 52, 68], 10);
    opponent.animations.add('left', [27, 43, 59, 75], 10);
    opponent.animations.add('up', [100])
  }
  player.width /= charWidth;
  player.height /= charHeight;
  opponent.width /= charWidth;
  opponent.height /= charHeight;
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(opponent);
  player.body.collideWorldBounds = true;
  opponent.body.collideWorldBounds = true;
  player.body.gravity.y = 500;
  opponent.body.gravity.y = 500;
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
  }
  if (cursors.right.isDown) {
    socket.emit('direct', {direction: 'right', side: playerSide});
  }
  if (cursors.up.isDown && player.body.touching.down) {
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
      player.animations.play(direction, true)
    } else {
      opponent.body.velocity[data.direction] = data.amount;
      opponent.animations.play(direction, true)
    }
  });
}
