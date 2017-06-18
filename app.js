'use strict'

var port     =      process.env.PORT || 8000;
var app      =      require('express')();
var server   =      require('http').Server(app);
var io       =      require('socket.io')(server);

server.listen(port);
console.log('Listening on port %d in %s mode.',
            server.address().port, app.settings.env)
