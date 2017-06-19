'use strict'

console.log("Duelr v1.0.0 started.");

var port        =       process.env.PORT || 8000;
var express     =       require('express');
var app         =       express();
var server      =       require('http').Server(app);
var io          =       require('socket.io')(server);
var CONST       =       require('./constants.js');
var Manager     =       require('./game/manager.js');
var Game        =       require('./game/game.js');
var Player      =       require('./game/player.js');
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
  while Manager.gameExists(code) {
    code = newGameCode();
  }
  console.log("Game code %d created.", code)
  return code;
}

// Player connection
io.on('connection', function(socket) {
  socket.player = playerNum++;

  // Player One creates a new game
  socket.on('createGame', function(data) {
    var gameCode = newGameCode();
    var player = new Player(gameCode, data.name, socket.player, socket, 'Left');
    var game = new Game(gameCode);
    game.setPlayerOne(player);
    Manager.games[gameCode] = gameCode;
  })

  socket.emit('playerid', { id: socket.player });
  console.log('Player ' + socket.player + ' has connected.');

  socket.on('disconnect', function() {
    console.log('Player ' + socket.player + ' has disconnected.');
    --playerNum
  });
})
