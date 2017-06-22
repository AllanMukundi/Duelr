'use strict'

class Manager {
  constructor() {
    console.log("Game manager started.");
    this.games = {};
    this.running = true;
  };

  addGame(gameCode, game) {
    this.games[gameCode] = game;
  }

  gameExists(gameCode) {
    gameCode = gameCode.toUpperCase();
    if (gameCode in this.games) {
      return true
    }
    return false;
  }
}

module.exports = Manager
