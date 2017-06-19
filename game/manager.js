'use strict'

class Manager {
  constructor() {
    console.log("Game manager started.");
    this.games = {};
    this.running = true;
  };

  addGame(game) {
    this.games.push(game);
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
