'use strict'

var CONST       =       require('./constants.js');

class Player {
  constructor(gameCode, name, id, socket, side) {
    this.gameCode = gameCode;
    this.name = name;
    this.id = id;
    this.socket = socket;
    this.side = side;
    this.health = CONST.PLAYER_HEALTH;
    this.dmg = CONST.PLAYER_DMG;
    this.alive = true;
  }
}

module.exports = Player;
