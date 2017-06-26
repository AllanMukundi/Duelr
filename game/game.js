'use strict'

class Game {
  constructor(gameCode) {
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
