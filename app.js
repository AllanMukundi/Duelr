'use strict'

var port        =      process.env.PORT || 8000;
var express     =      require('express');
var app         =      express();
var server      =      require('http').Server(app);
var io          =      require('socket.io')(server);
var playerNum   =      0

// Start the server
server.listen(port);
console.log('Listening on port %d in %s mode.',
            server.address().port, app.settings.env);

app.use(express.static(__dirname + '/static'));

// Serve index.html at root
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Player connection
io.on('connection', function(socket) {
  socket.player = playerNum++;

  socket.emit('playerid', { id: socket.player });
  console.log('Player ' + socket.player + ' has connected.');

  socket.on('disconnect', function() {
    console.log('Player ' + socket.player + ' has disconnected.');
    --playerNum
  });

});
