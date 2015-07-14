/**
 * Project: darlingjs (GameEngine).
 * Copyright (c) 2013, Eugene-Krevenets
 */

'use strict';

var darling = require('darlingjs');

/**
 * Describe up/down keyCode, and min/max value for Y
 */
darling.c('control', {
  up: null,
  down: null,
  minY: 0,
  maxY: 0
});

/**
 * Component-marker for paddler moved down
 */
darling.c('moveDown', {
  speed: 1,
  //limit value of Y
  limit: 0
});

/**
 * Component-marker for paddler moved up
 */
darling.c('moveUp', {
  speed: 1,
  //limit value of Y
  limit: 0
});

var m = {};

/**
 * System handler keyDown/keyUp and add/remove moveDown/moveUp component from entity
 */
m.system = darling.system({
  //for with entity that holds:
  require: ['control'],

  getInitialState: function () {
    return {
      //map to reflect keyCode to entities
      keyToEntities: []
    };
  },

  /**
   * System added to the World
   */
  added: function() {
    this.state.keyToEntities.length = 256;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  },

  /**
   * System removed from the World
   *
   */
  removed: function() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  },

  /**
   * Entity added to the System
   *
   * @param entity
   */
  addEntity: function(entity) {
    this.watchKey(entity.control.up, entity);
    this.watchKey(entity.control.down, entity);
  },

  /**
   * Entity removed from the System
   *
   * @param entity
   */
  removeEntity: function(entity) {
    this.stopWatchingKey(entity.control.up, entity);
    this.stopWatchingKey(entity.control.down, entity);
  },

  /**
   * System start watching the key for the entity
   *
   * @private
   * @param keyCode
   * @param entity
   */
  watchKey: function(keyCode, entity) {
    if (!this.state.keyToEntities[keyCode]) {
      this.state.keyToEntities[keyCode] = [];
    }

    this.state.keyToEntities[keyCode].push(entity);
  },

  /**
   * System stop watching the key for the entity
   *
   * @private
   * @param keyCode
   * @param entity
   */
  stopWatchingKey: function(keyCode, entity) {
    var entities = this.state.keyToEntities[keyCode];
    var index = entities.indexOf(entity);
    entities.splice(index, 1);
  },

  /**
   * Handle KeyDown event
   *
   * @private
   * @param e
   * @returns {boolean}
   */
  onKeyDown: function(e) {
    var entities = this.state.keyToEntities[e.keyCode];
    if (entities && entities.length > 0) {
      for(var i = 0, count = entities.length; i < count; i++) {
        var entity = entities[i],
          control = entity.control;
        if (control.down === e.keyCode) {
          entity.add('moveDown', {
            limit: control.maxY,
            speed: control.speed
          });
        }
        if (entity.control.up === e.keyCode) {
          entity.add('moveUp', {
            limit: control.minY,
            speed: control.speed
          });
        }
      }
      e.preventDefault();
      return false;
    }
  },

  onKeyUp: function(e) {
    var entities = this.state.keyToEntities[e.keyCode];
    if (entities && entities.length > 0) {
      for(var i = 0, count = entities.length; i < count; i++) {
        var entity = entities[i];
        if (entity.control.down === e.keyCode) {
          entity.remove('moveDown');
        }
        if (entity.control.up === e.keyCode) {
          entity.remove('moveUp');
        }
      }
    }
  }
});

/**
 * System move up entity if it holds moveUp and ng2D components
 */
m.moveUp = darling.system({//$s('controlMoveUp', {
  //for with entity that holds:
  require: ['moveUp', 'ng2D'],

  /**
   * Update each entity from the System on the World tick
   */
  updateOne: function(entity) {
    if (entity.ng2D.y <= entity.moveUp.limit) {
      entity.remove('moveUp');
      return;
    }

    entity.ng2D.y -= entity.moveUp.speed;
  }
});

/**
 * System move down entity if it holds moveUp and ng2D components
 */
m.moveDown = darling.system({
  //for with entity that holds:
  require: ['moveDown', 'ng2D'],

  /**
   * Update each entity from the System on the World tick
   */
  updateOne: function(entity) {
    if (entity.ng2D.y >= entity.moveDown.limit) {
      entity.remove('moveDown');
      return;
    }
    entity.ng2D.y += entity.moveDown.speed;
  }
});

module.exports = m;
