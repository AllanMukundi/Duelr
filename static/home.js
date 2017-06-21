'use strict'

function home() {
  document.getElementById('home').style.display = 'inline-block';
  document.getElementById('creatingGame').style.display = 'none';
  document.getElementById('showCode').style.display = 'none';
}

function createGame() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('creatingGame').style.display = 'inline-block';
  document.getElementById('showCode').style.display = 'none';
  document.getElementById('nameBox').focus();
}

function showCode() {
  var name = document.getElementById('nameBox').value;
  socket.emit('createGame', {name: name});
  return false;
}

socket.on('createGameCode', function(data) {
  document.getElementById('creatingGame').style.display = 'none';
  document.getElementById('showCode').style.display = 'inline-block';
  document.getElementById('code').innerHTML = data.gameCode;
});
