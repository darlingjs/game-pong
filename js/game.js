/**
 * Quetsions:
 *
 * how to inject systems to other system.
 * Before that we was have Modules for this.
 *
 * @type {exports}
 */
var darling = require('darlingjs');

var control = require('./control');
var dom = require('./dom');
var gameplay = require('./gameplay');
var physics = require('./physics');

var animationFrame = require('darlingjs-live-on-animation-frame');
var aspectRatio = 2,
  /**
   * window.innerWidth and window.innerHeight === 0 inside iFrame at 1st moment.
   * Need to get size from documentElement
   */
  windowWidth = document.documentElement.clientWidth,
  windowHeight = document.documentElement.clientHeight;

var width, height;

/**
 * fit to screen with aspect
 */
if (windowWidth < aspectRatio * windowHeight) {
  width = windowWidth;
  height = windowWidth / aspectRatio;
} else {
  width = aspectRatio * windowHeight;
  height = windowHeight;
}

var w = darling.world('pong')
  .pipe(dom({
    //target div element
    target: '#gameStage',
    width: width,
    height: height,
    backgroundColor: '#008B9A'
  }))
  .pipe(control.system())
  .pipe(control.moveUp())
  .pipe(control.moveDown())
  .pipe(physics.impulseUpdate({
    width: width,
    height: height
  }))
  .pipe(physics.collision())
  .pipe(gameplay({
    width: width,
    height: height,

    //TODO: should split system in system that catch current position of ball
    //and regular code that update scores in DOM

    //target DOM element for player 1 score output
    player1TargetElement: '#playerScore1',

    //target DOM element for player 2 score output
    player2TargetElement: '#playerScore2'
  }))
  .live(animationFrame);


//settle entities

var paddleHeight = height/3;
if (paddleHeight > 100) {
  paddleHeight = 100;
}

w.settle('LeftPaddle', {
  domView: {color: '#ED4501'},
  ng2D: {x: 20, y: height / 2},
  ng2DSize: {width: 10, height: paddleHeight},
  control: {
    up: 87 /* W */, down: 83 /* S */,
    maxY: height - paddleHeight/2, minY: paddleHeight/2,
    speed: 4
  },
  solid: {
    type: 'left-paddle'
  }
});

w.settle('RightPaddle', {
  domView: {color: '#BBD401'},
  ng2D: {x: width - 20, y: height / 2},
  ng2DSize: {width: 10, height: paddleHeight},
  control: {
    up: 38 /* arrow up */, down: 40 /* arrow down */,
    maxY: height - paddleHeight/2, minY: paddleHeight/2,
    speed: 4
  },
  solid: {
    type: 'right-paddle'
  }
});


//throw the ball
var angle = Math.PI * Math.random(),
  power = 5;

if (angle < Math.PI / 2) {
  angle -= Math.PI / 4;
} else {
  angle += Math.PI / 4;
}

w.settle('ball', {
  domView: {
    color: 'rgb(255,255,255)'
  },
  ng2D: {
    x: width / 2, y: height / 2
  },
  ng2DSize: {
    width: 10, height: 10
  },
  impulse: {
    x: power * Math.cos(angle), y: power * Math.sin(angle)
  },
  solid: {
    type: 'ball'
  },
  ball: true
});
