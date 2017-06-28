'use strict'

console.log("Duelr v1.0.0 started.");

var port        =       process.env.PORT || 8000;
var express     =       require('express');
var app         =       express();
var server      =       require('http').Server(app);
var io          =       require('socket.io')(server);
var CONST       =       require('./game/constants.js');
var gameManager =       require('./game/manager.js');
var Game        =       require('./game/game.js');
var Player      =       require('./game/player.js');
var Manager     =       new gameManager();
var playerNum   =       0

// Start the server
server.listen(port);
console.log(CONST);
console.log('Listening on port %d in %s mode.',
            server.address().port, app.settings.env);

app.use(express.static(__dirname + '/static'));

// Serve index.html at root
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Returns a random number between the two parameters [min, max)
function randRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Generates a unique code for each game started (11,881,376 options)
function newGameCode() {
  var code = "";
  var choices = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for(var i = 0; i < CONST.GAME_CODE_LEN; ++i) {
    code += choices.charAt(randRange(0, 26));
  }
  while (Manager.gameExists(code)) {
    code = newGameCode();
  }
  return code;
}

// Player connection
io.on('connection', function(socket) {
  var game;
  socket.id = playerNum++;

  // Player One creates a new game
  socket.on('createGame', function(data) {
    var gameCode = newGameCode();
    var player = new Player(gameCode, data.name, socket.id, socket, 'left');
    var game = new Game(gameCode);
    socket.player = player;
    game.setPlayerOne(player);
    Manager.addGame(gameCode, game);
    socket.emit('createGameCode', {gameCode: gameCode})
  });

  // Player Two joins a game
  socket.on('joinGame', function(data) {
    var game = Manager.games[data.gameCode];
    if (game == null) {
      socket.emit('startGame', {status: null});
    } else if (game.playerTwo != undefined) {
      socket.emit('startGame', {status: 'full'});
    } else {
      var player = new Player(data.gameCode, data.name, socket.id, socket, 'right');
      game.setPlayerTwo(player);
      socket.player = player;
      var opponent = game.playerOne;
      socket.emit('startGame', {gameCode: data.gameCode, status: 'valid', side: 'right', nameP1: opponent.name, nameP2: player.name});
      opponent.socket.emit('startGame', {gameCode: data.gameCode, status: 'valid', side: 'left', nameP1: opponent.name, nameP2: player.name});
    }
  });

  console.log('Player ' + socket.id + ' has connected.');

  socket.on('attach', function(data) {
    game = Manager.games[data.gameCode];
  });

  socket.on('direct', function(data) {
    var amount;
    var direction = 'x';
    if (data.direction == 'left') {
      amount = -CONST.MOVEMENT;
    } else if (data.direction == 'right') {
      amount = CONST.MOVEMENT;
    } else {
      amount = -(CONST.MOVEMENT);
      direction = 'y'
    }
    game.playerOne.socket.emit('move', {direction: direction, amount: amount, side: data.side});
    game.playerTwo.socket.emit('move', {direction: direction, amount: amount, side: data.side});
  });

  socket.on('aim', function(data) {
    game.playerOne.socket.emit('fire', {side: data.side});
    game.playerTwo.socket.emit('fire', {side: data.side});
  })

  // Disconnects a player
  socket.on('disconnect', function() {
    console.log('Player ' + socket.id + ' has disconnected.');
  });
})
