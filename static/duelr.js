'use strict'

var gameCode;
var game;
var Game = {};
var floor;
var player;
var opponent;
var playerSide;
var leftName;
var rightName;
var playerHearts;
var opponentHearts;
var playerBullets;
var opponentBullets;
var playerHealth = 100;
var opponentHealth = 100;
var width = 1024;
var height = Math.max(window.innerHeight, 768);
var unit = 64;

function start(code, side, nameP1, nameP2) {
  gameCode = code;
  playerSide = side;
  leftName = nameP1;
  rightName = nameP2;
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
  game.load.image('playerBullet', 'assets/playerBullet.png');
  game.load.image('opponentBullet', 'assets/opponentBullet.png');
  game.load.image('heart', 'assets/heart.png');
  game.load.spritesheet('players', 'assets/sprites.png', 128, 256);
}

Game.create = function() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // Background/Ground
  createGround();
  // HUD
  createHUD();
  // Players
  createPlayers();
  // Bullets
  createAmmo();
  // Socket.io
  socket.emit('attach', {gameCode: gameCode});
  }

Game.update = function() {
  // Physics settings
  game.physics.arcade.collide(player, floor);
  game.physics.arcade.collide(opponent, floor);
  game.physics.arcade.overlap(player.bullets, opponent.bullets, bulletCollision, null, this);
  game.physics.arcade.overlap(opponent, player.bullets, playerCollision, null, this);
  game.physics.arcade.overlap(player, opponent.bullets, playerCollision, null, this);
  player.body.velocity.x = 0;
  opponent.body.velocity.x = 0;
  // Movement from server
  var cursors = game.input.keyboard.createCursorKeys();
  var shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  shoot.onDown.add(shootBullet, this);
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
    if (data.side == playerSide) {
      player.body.velocity[data.direction] = data.amount;
      player.animations.play(direction, true);
      if (direction == 'right') {
        player.direction = 500;
      } else if (direction == 'left') {
        player.direction = -500;
      }
    } else {
      opponent.body.velocity[data.direction] = data.amount;
      opponent.animations.play(direction, true);
      if (direction == 'right') {
        opponent.direction = 500;
      } else if (direction == 'left') {
        opponent.direction = -500;
      }
    }
  });
  if (player.health == 0 || opponent.health == 0) {
    var msg = 'Game over.\nClick to restart!';
    var style = {font: '100px Arial', align: 'center'};
    var gameOver = game.add.text((2.75 * unit), height / 2.5, msg, style);
    game.input.keyboard.stop();
    document.body.className = 'grey';
    if (game.input.activePointer.isDown) {
      location.reload();
    }
  }
}

function createGround() {
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
}

function createHUD() {
  // Icons
  var playerOneHUD = game.add.sprite(unit, (height / unit), 'playerOneHUD');
  var playerTwoHUD = game.add.sprite(width - (3 * unit), (height / unit), 'playerTwoHUD');
  // Names
  var style = {font: '32px Racing Sans One', fill: ['#232526', '#414345'], stroke: '#ffffff'};
  // Find the appropriate width to offset Player Two's name by------------------
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = '32px Racing Sans One';
  var tempWidth = context.measureText(rightName).width;
  //----------------------------------------------------------------------------
  leftName = game.add.text((3 * unit), playerOneHUD.y + (unit / 2), leftName, style);
  rightName = game.add.text(width - (3 * unit) - tempWidth, playerTwoHUD.y + (unit / 2), rightName, style);
  // Hearts
  playerHearts = game.add.group();
  for(var i = 0, x = leftName.x; i < 5; ++i, x += (unit / 2)) {
    playerHearts.create(x, leftName.y + (unit / 2), 'heart');
  }
  opponentHearts = game.add.group();
  for(var i = 0, x = playerTwoHUD.x - (unit / 2.5); i < 5; ++i, x -= (unit / 2)) {
    opponentHearts.create(x, rightName.y + (unit / 2), 'heart');
  }
  playerHearts.reverse();
  opponentHearts.reverse();
}

function createPlayers() {
  var charOne = game.add.sprite(unit, height - (8 * unit), 'players');
  charOne.frame = 5;
  charOne.animations.add('right', [20, 36, 52, 68], 10);
  charOne.animations.add('left', [27, 43, 59, 75], 10);
  charOne.direction = 500;
  var charTwo = game.add.sprite(width - (3 * unit), height - (8 * unit), 'players');
  charTwo.frame = 83;
  charTwo.animations.add('right', [98, 114, 3, 19], 10);
  charTwo.animations.add('left', [109, 125, 12, 28], 10);
  charTwo.direction = -500;
  if (playerSide == 'left') {
    player = charOne;
    opponent = charTwo;
    player.hearts = playerHearts;
    player.health = playerHealth;
    opponent.hearts = opponentHearts;
    opponent.health = opponentHealth;
  } else {
    player = charTwo;
    opponent = charOne
    player.hearts = opponentHearts;
    player.health = opponentHealth;
    opponent.hearts = playerHearts;
    opponent.health = opponentHealth;
  }
  player.scale.setTo(0.7, 0.7);
  opponent.scale.setTo(0.7, 0.7);
  // Physics settings
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(opponent);
  player.body.setSize(128, 156, 0, 100);
  opponent.body.setSize(128, 156, 0, 100);
  player.body.collideWorldBounds = true;
  opponent.body.collideWorldBounds = true;
  player.body.gravity.y = 500;
  opponent.body.gravity.y = 500;
}

function createAmmo() {
  playerBullets = game.add.group();
  playerBullets.enableBody = true;
  playerBullets.createMultiple(3, 'playerBullet');
  playerBullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', reset);
  playerBullets.callAll('anchor.setTo', 'anchor', 0.5, -0.5);
  playerBullets.setAll('checkWorldBounds', true);
  opponentBullets = game.add.group();
  opponentBullets.enableBody = true;
  opponentBullets.createMultiple(3, 'opponentBullet');
  opponentBullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', reset);
  opponentBullets.callAll('anchor.setTo', 'anchor', 0.5, -0.5);
  opponentBullets.setAll('checkWorldBounds', true);
  player.bullets = playerBullets;
  opponent.bullets = opponentBullets;
}

function reset(bullet) {
  bullet.kill();
}

function playerShoot() {
  var bullet = playerBullets.getFirstExists(false);
  if (bullet) {
    bullet.reset(player.x + 70, player.y + 105);
    bullet.body.velocity.x = player.direction;
  }
}

function opponentShoot() {
  var bullet = opponentBullets.getFirstExists(false);
  if (bullet) {
    bullet.reset(opponent.x + 70, opponent.y + 105);
    bullet.body.velocity.x = opponent.direction;
  }
}

function bulletCollision(bulletOne, bulletTwo) {
  bulletOne.kill();
  bulletTwo.kill();
}

function playerCollision(person, bullet) {
  var heart = person.hearts.getFirstExists(true);
  if (heart) {
    reset(bullet);
    heart.kill();
    person.health -= 20;
  }
}

function shootBullet() {
  socket.emit('aim', {side: playerSide});
}

socket.on('fire', function(data) {
  if (data.side == playerSide) {
    playerShoot();
  } else {
    opponentShoot();
  }
});
