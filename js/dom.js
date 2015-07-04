var darling = require('darlingjs');

/**
 * DOM component
 */
darling.c('domView', {
  //color of DOM element
  color: null,

  //element for temporary storing
  element: null
});

/**
 * Get Vendor Prefix. Based on CraftyJS <http://craftyjs.com>
 * @returns {*}
 */
function getVendorPrefix() {
  var ua = navigator.userAgent.toLowerCase(),
    match = /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(o)pera(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
      /(ms)ie ([\w.]+)/.exec(ua) ||
      /(moz)illa(?:.*? rv:([\w.]+))?/.exec(ua) || [],
    prefix = (match[1] || match[0]);

  //browser specific quirks
  if (prefix === "moz") prefix = "Moz";
  if (prefix === "o") prefix = "O";
  return prefix;
}

/**
 * Update position of DOM element in WebKit style
 * @param prefix
 */
function buildUpdatePosition(prefix) {
  var property = prefix + 'Transform';
  return function (element, ng2D, ng2DSize) {
    element.style[property] = 'translate3d('
    + ~~(ng2D.x - 0.5 * ng2DSize.width) + 'px, '
    + ~~(ng2D.y - 0.5 * ng2DSize.height) + 'px, 0)';
  };
}

/**
 * System that renderer entity into the DOM
 */
module.exports = darling.system({
  require: ['ng2D', 'ng2DSize', 'domView'],

  //like react
  getInitState: function () {
    return {
      target: null,

      width: 400,
      height: 300,

      backgroundColor: 'rgb(0,0,0)',

      //@private
      stageElement: null,

      //@private
      updatePosition: null
    };
  },

  /**
   * System added to the World
   */
  added: function () {
    var stageElement = document.querySelector(this.target);
    if (!stageElement) {
      throw new Error('can\'t find ' + id + ' as stage for dom renderer')
    }

    //fit stage DIV element to the size
    stageElement.style.backgroundColor = this.backgroundColor;
    stageElement.style.width = this.width + 'px';
    stageElement.style.height = this.height + 'px';
    stageElement.style.margin = '0 auto';

    //??? this.setState()
    this.state.stageElement = stageElement;
    this.state.updatePosition = buildUpdatePosition(getVendorPrefix());
  },

  /**
   * System removed from the World
   */
  //TODO: ????. Should inside do this.state = null;
  //and state will lost, and we don't need it
  //removed: function () {
  //  this.state.stageElement = null;
  //},

  /**
   * Add new entity to the System
   */
  addEntity: function ($entity) {
    var domView = $entity.domView,
      ng2DSize = $entity.ng2DSize;

    //create DIV for each entity
    var element = document.createElement('div');

    element.style.backgroundColor = domView.color;
    element.style.width = ng2DSize.width + 'px';
    element.style.height = ng2DSize.height + 'px';

    element.style.position = 'absolute';

    this.state.stageElement.appendChild(element);
    this.state.updatePosition(element, $entity.ng2D, $entity.ng2DSize);

    domView.element = element;

    //VS

    domView.setState({
      element: element
    });
  },

  /**
   * Remove entity from the System
   */
  remoteEntity: function ($entity) {
    var domView = $entity.domView;
    this.stageElement.removeChild(domView.element);
    domView.element = null;
  },

  /**
   * Update position of DIV elements each tick
   */
  update: function ($entity) {
    this.updatePosition($entity.domView.element, $entity.ng2D, $entity.ng2DSize);
  }
});
