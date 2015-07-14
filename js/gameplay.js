/**
 * Project: darlingjs (GameEngine).
 * Copyright (c) 2015, Eugene-Krevenets
 */

'use strict';

var darling = require('darlingjs');

/**
 * System for game simulation:
 * * track when the ball slipped from the game field
 * * calc scores for player1, player2;
 * * show scores
 */

module.exports = darling.system({
  //deal with entity that holds components:
  require: ['ball', 'ng2D', 'ng2DSize'],

  getInitialState: function() {
    return {
      width: 400,
      height: 300,

      //start scores
      player1Score: 0,
      player2Score: 0,

      player1TargetElement: null,
      player2TargetElement: null,

      //@private
      player1Text: null,
      //@private
      player2Text: null
    };
  },

  /**
   * System added to the World
   */
  added: function() {
    var element;
    element = document.querySelector(this.state.player1TargetElement);
    //TODO: setState
    this.state.player1Text = document.createTextNode('');
    element.appendChild(this.state.player1Text);

    element = document.querySelector(this.state.player2TargetElement);
    //TODO: setState
    this.state.player2Text = document.createTextNode('');
    element.appendChild(this.state.player2Text);

    this.validatePlayersState();
  },

  /**
   * On each tick of the World, we check position of the ball
   * And if it slipped away. Set scores for the player.
   * And set ball back.
   */
  updateOne: function(entity) {
    if (entity.ng2D.x < 0.5 * entity.ng2DSize.width) {
      //TODO: setState
      this.state.player1Score++;
      this.setBallToDefaultPosition(entity);
      this.validatePlayersState();
    } else if (entity.ng2D.x > this.state.width - 0.5 * entity.ng2DSize.width) {
      //TODO: setState
      this.state.player2Score++;
      this.setBallToDefaultPosition(entity);
      this.validatePlayersState();
    }
  },

  /**
   * Put ball back
   *
   * @private
   * @param ball
   */
  setBallToDefaultPosition: function(ball) {
    ball.ng2D.x = this.state.width / 2;
    ball.impulse.y += 3 * (0.5 - Math.random());
  },

  /**
   * Validate player score state
   */
  validatePlayersState: function() {
    //this.setState
    this.state.player1Text.data = this.state.player1Score + '';
    this.state.player2Text.data = this.state.player2Score + '';
  }
});
