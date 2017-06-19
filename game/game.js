'use strict'

class Game() {
  constructor(gameCode) {
    console.log("Game created.");
    this.gameCode = gameCode;
    this.running = true;
  }

  setPlayerOne(player) {
    this.playerOne = player;
  }

  setPlayerTwo(player) {
    this.playerTwo = player;
  }
}

module.exports = Game;
