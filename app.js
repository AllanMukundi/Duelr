'use strict'

var port     =      process.env.PORT || 8000;
var express  =      require('express');
var app      =      express();
var server   =      require('http').Server(app);
var io       =      require('socket.io')(server);

// Start the server
server.listen(port);
console.log('Listening on port %d in %s mode.',
            server.address().port, app.settings.env);

app.use(express.static(__dirname + '/static'));

// Serve index.html at root
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
})
