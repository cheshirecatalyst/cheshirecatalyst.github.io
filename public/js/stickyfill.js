/*! audero-sticky.js 0.3.2 | Aurelio De Rosa (@AurelioDeRosa) | MIT/GPL-3.0 Licensed */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sticky = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (!("classList" in document.createElement("_"))
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;
    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('classlist-polyfill');

var _eventEmitter = require('./helpers/event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _store = require('./helpers/store');

var _store2 = _interopRequireDefault(_store);

var _style = require('./helpers/style');

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @typedef SettingsHash
 * @type {Object}
 * @property {string} [selector='.sticky'] The selector used to identify the
 * elements processed by this library
 * @property {string} [activeClass='sticky-active'] The class name added when an
 * element starts sticking
 */

/**
 * The default values for settings available
 *
 * @type {SettingsHash}
 */
var defaults = {
   selector: '.sticky',
   activeClass: 'sticky--active'
};

/**
 * The settings to use when adding the event handler for the scroll event
 *
 * @type {Object}
 */
var scrollOptions = {
   passive: true
};

/**
 * The properties needed by the placeholder element to have the
 * occupy the same space as the element when in its original position
 *
 * @type {string[]}
 */
    var properties = ['width', 'height', 'left', 'marginLeft', 'marginRight', 'zIndex'];

/**
 * The namespace used to store data related to the library
 * on the elements of a page
 *
 * @type {string}
 */
var namespace = 'auderosticky';

/**
 * The store used to manage the data stored
 *
 * @type {store}
 */
var store = new _store2.default(namespace);

/**
 * Tests if passive event listeners are supported
 *
 * @return {boolean}
 */
function isPassiveEventListenerSupported() {
   var isSupported = false;

   try {
      var options = Object.defineProperty({}, 'passive', {
         get: function get() {
            isSupported = true;
         }
      });

      window.addEventListener('', null, options);
   } catch (ex) {}

   return isSupported;
}

/**
 * Calculates the top and bottom margins of the element that has to stick
 * at the moment it'll stick
 *
 * @param {Sticky} sticky An instance of a Sticky object
 *
 * @returns {Object}
 */
function getStickyMargins(sticky) {
   // Knowing the top and bottom margins at the time the element
   // will stick is important because the specifications require
   // to consider these values when calculating the boundaries
   // in which the element sticks.
   var elementStyle = void 0,
       stickyMargins = void 0;

   sticky.element.classList.add(sticky.settings.activeClass);
   elementStyle = window.getComputedStyle(sticky.element);
   stickyMargins = {
      marginBottom: elementStyle.marginBottom,
      marginTop: elementStyle.marginTop
   };
   sticky.element.classList.remove(sticky.settings.activeClass);

   return stickyMargins;
}

/**
 * Returns the z-index value of the element if one is defined;
 * <code>undefined</code> otherwise
 *
 * @param {HTMLElement} element The element whose z-index value must be calculated
 *
 * @return {number|undefined}
 */
function getComputedZIndex(element) {
   var position = element.style.position;

   // Set the position to relative to address a bug in WebKit browsers (issue #15562)
   // https://bugs.webkit.org/show_bug.cgi?id=15562
   element.style.position = 'relative';

   var zIndex = Number(window.getComputedStyle(element).zIndex);

   element.style.position = position;

   return !isNaN(zIndex) ? zIndex : undefined;
}

/**
 * Returns the z-index value of the element if one is defined.
 * Otherwise, it calculates the z-index value of an element based
 * on its position in the DOM, among other elements selected
 * by the CSS selector provided
 *
 * @param {HTMLElement} element The element whose z-index value must be calculated
 * @param {string} selector The CSS selector to use
 *
 * @return {number}
 */
function getZIndex(element, selector) {
   var zIndex = getComputedZIndex(element);

   if (zIndex !== undefined) {
      return zIndex;
   }

   var stickyElements = [].slice.call(document.querySelectorAll(selector));

   return stickyElements.indexOf(element) + 1;
}

/**
 * Turns the unitless values of the object provided in pixels
 *
 * @param {Object} propertiesHash The object whose values will be converted
 *
 * @return {Object}
 */
function convertNumbersToPixels(propertiesHash) {
   var object = {};

   for (var property in propertiesHash) {
      object[property] = propertiesHash[property] + 'px';
   }

   return object;
}

/**
 * Cleans up allocated resources and effects
 *
 * @param {Sticky} sticky An instance of a Sticky object
 */
function cleanUp(sticky) {
   var data = store.getData(sticky.element);

   _style2.default.resetStyleProperties(sticky.element.style, properties.concat(['marginTop', 'marginBottom', 'top', 'bottom']));
   sticky.element.style.position = data.position;

   if (data.placeholder && data.placeholder.parentNode) {
      data.placeholder.parentNode.removeChild(data.placeholder);
   }
}

/**
 * Calculates the boundaries of the sticky element, that is at what
 * positions it has to start and end to stick.
 *
 * @param {HTMLElement} element The element based on which the boundaries are calculated
 * @param {Object} stickyMargins An object containing additional margins to consider
 * in the calculation
 *
 * @return {Object}
 */
function calculateBoundaries(element, stickyMargins) {
   var boundaries = {
      start: 0,
      end: 0
   };
   var elementStyle = window.getComputedStyle(element);
   var parentStyle = element.parentNode.getBoundingClientRect();

   // If the value of the "top" property is defined, in which case it has
   // a value different from "auto", the element will stick on the top.
   if (elementStyle.top !== 'auto') {
      boundaries.start = element.getBoundingClientRect().top - parseFloat(elementStyle.top);
      boundaries.end = parentStyle.bottom - (parseFloat(stickyMargins.marginBottom) || 0);
   } else {
      boundaries.start = element.getBoundingClientRect().bottom + parseFloat(elementStyle.bottom);
      boundaries.end = parentStyle.top + (parseFloat(stickyMargins.marginTop) || 0);
   }

   // Normalize the start and the limit position of the element.
   // This is needed when on the load of a page the position
   // isn't set at the top of the page.
   boundaries.start += window.pageYOffset;
   boundaries.end += window.pageYOffset;

   return boundaries;
}

/**
 * Updates the style of the placeholder element based on the current
 * values of the sticky element
 *
 * @param {Sticky} sticky An instance of a Sticky object
 */
function updatePlaceholderStyle(sticky) {
   var startPosition = sticky.element.getBoundingClientRect();
   var placeholder = store.getData(sticky.element, 'placeholder');

   _style2.default.copyStyleProperties(placeholder.style, window.getComputedStyle(sticky.element), ['top', 'bottom', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight']);
   _style2.default.copyStyleProperties(placeholder.style, convertNumbersToPixels(startPosition), ['height', 'left']);
}

/**
 * Returns the function to use as the event handler for
 * the <code>scroll</code> event
 *
 * @param {Sticky} sticky An instance of a Sticky object
 *
 * @return {Function}
 */
function onScroll(sticky) {
   var stickyMargins = getStickyMargins(sticky);
   var elementStyle = window.getComputedStyle(sticky.element);
   var distanceFromSide = elementStyle.top !== 'auto' ? parseFloat(elementStyle.top) : parseFloat(elementStyle.bottom);

   function startSticky() {
      var data = store.getData(sticky.element);

      updatePlaceholderStyle(sticky);
      data.position = sticky.element.style.position;
      store.setData(sticky.element, data);
      _style2.default.copyStyleProperties(sticky.element.style, {
         position: 'fixed'
      });
      _style2.default.copyStyleProperties(sticky.element.style, data.placeholder.style, properties);
      sticky.element.parentNode.insertBefore(data.placeholder, sticky.element);
      _eventEmitter2.default.fireEvent('stickystart', sticky.element);
      sticky.element.classList.add(sticky.settings.activeClass);
   }

   function endSticky() {
      cleanUp(sticky);
      _eventEmitter2.default.fireEvent('stickyend', sticky.element);
      sticky.element.classList.remove(sticky.settings.activeClass);
   }

   function getBoundaries(isSticking) {
      var placeholder = store.getData(sticky.element).placeholder;

      // The boundaries are calculated based on the element
      // itself if it's not sticking;
      // otherwise the placeholder is used.
      return isSticking ? calculateBoundaries(placeholder, stickyMargins) : calculateBoundaries(sticky.element, stickyMargins);
   }

   function stickToTop() {
      var isAdded = !!store.getData(sticky.element).placeholder.parentNode;
      var boundaries = getBoundaries(isAdded);
      var height = parseFloat(window.getComputedStyle(sticky.element).height) || 0;
      var gap = boundaries.end - height - window.pageYOffset;
      var isInRange = window.pageYOffset >= boundaries.start && window.pageYOffset <= boundaries.end;

      if (isInRange) {
         if (!isAdded) {
            startSticky();
         }

         sticky.element.style.top = gap - distanceFromSide >= 0 ? '' : gap + 'px';
      } else if (isAdded) {
         endSticky();
      }
   }

   function stickToBottom() {
      var isAdded = !!store.getData(sticky.element).placeholder.parentNode;
      var boundaries = getBoundaries(isAdded);
      var height = parseFloat(window.getComputedStyle(sticky.element).height) || 0;
      var windowBottom = window.pageYOffset + window.innerHeight;
      var gap = boundaries.end + height - windowBottom;
      var isInRange = windowBottom <= boundaries.start && windowBottom >= boundaries.end;

      if (isInRange) {
         if (!isAdded) {
            startSticky();
         }

         sticky.element.style.bottom = gap + distanceFromSide <= 0 ? '' : -gap + 'px';
      } else if (isAdded) {
         endSticky();
      }
   }

   return elementStyle.top !== 'auto' ? stickToTop : stickToBottom;
}

/**
 * Returns the function to use as the event handler for
 * the <code>resize</code> event
 *
 * @param {Sticky} sticky An instance of a Sticky object
 *
 * @return {Function}
 */
function onResize(sticky) {
   return function () {
      sticky.destroy();
      sticky.init();
      store.getData(sticky.element, 'handlers').scroll();
   };
}

/**
 * Binds the events for the sticky object provided
 *
 * @param {Sticky} sticky An instance of a Sticky object
 */
function bindEvents(sticky) {
   var handlers = store.getData(sticky.element, 'handlers');

   window.addEventListener('load', handlers.scroll);
   window.addEventListener('scroll', handlers.scroll, isPassiveEventListenerSupported() ? scrollOptions : false);
   window.addEventListener('resize', handlers.resize);
}

/**
 * Unbinds the events for the sticky object provided
 *
 * @param {Sticky} sticky An instance of a Sticky object
 */
function unbindEvents(sticky) {
   var handlers = store.getData(sticky.element, 'handlers');

   window.removeEventListener('load', handlers.scroll);
   window.removeEventListener('scroll', handlers.scroll, isPassiveEventListenerSupported() ? scrollOptions : false);
   window.removeEventListener('resize', handlers.resize);
}

var Sticky = function () {
   /**
    * Creates a new Sticky object
    *
    * @param {HTMLElement} element The element to render as sticky
    * @param {SettingsHash} [options={}] An object of options to customize the library
    *
    * @constructor
    */
   function Sticky(element) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Sticky);

      this.element = element;
      this.settings = _extends({}, defaults, options);
   }

   /**
    * Tests if the <code>sticky</code> value for the <code>position</code>
    * property is supported
    *
    * @return {boolean}
    */


   _createClass(Sticky, [{
      key: 'init',


      /**
       * Initializes the library
       */
      value: function init() {
         if (store.getData(this.element)) {
            throw new Error('This element has already been initialized');
         }

         var placeholder = document.createElement(this.element.nodeName);

         store.setData(this.element, {
            placeholder: placeholder,
            handlers: {
               scroll: onScroll(this),
               resize: onResize(this)
            },
            position: this.element.style.position
         });

         _style2.default.copyStyleProperties(placeholder.style, {
            visibility: 'hidden',
            zIndex: getZIndex(this.element, this.settings.selector)
         });

         updatePlaceholderStyle(this);
         bindEvents(this);

         // Execute the scroll handler to position the element if it
         // should stick when the page is loaded
         store.getData(this.element, 'handlers').scroll();
      }

      /**
       * Removes the effects of the library and clean up all the resources
       */

   }, {
      key: 'destroy',
      value: function destroy() {
         cleanUp(this);
         unbindEvents(this);
         store.removeData(this.element);
      }
   }], [{
      key: 'isFeatureSupported',
      value: function isFeatureSupported() {
         var prefixes = ['ms', 'webkit'];
         var testStyle = 'position:sticky;';
         var element = document.createElement('div');

         prefixes.forEach(function (prefix) {
            testStyle += 'position:-' + prefix + '-sticky;';
         });
         element.style.cssText = testStyle;

         return !!element.style.position;
      }

      /**
       * Autoinitializes all the elements of the page matched by the selector provided
       * in the options or the default one if no selector is provided
       *
       * @param {SettingsHash} [options] An object of options to customize the library
       */

   }, {
      key: 'autoInit',
      value: function autoInit() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         options = _extends({}, defaults, options);

         [].forEach.call(document.querySelectorAll(options.selector), function (element) {
            var sticky = new Sticky(element, options);

            sticky.init();
         });
      }
   }]);

   return Sticky;
}();

exports.default = Sticky;
module.exports = exports['default'];

},{"./helpers/event-emitter":3,"./helpers/store":4,"./helpers/style":5,"classlist-polyfill":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The class representing an event emitter
 *
 * @class
 */
var EventEmitter = function () {
   function EventEmitter() {
      _classCallCheck(this, EventEmitter);
   }

   _createClass(EventEmitter, null, [{
      key: 'namespaceEvent',

      /**
       * Namespaces an event
       *
       * @param {string} eventName The event name
       *
       * @return {string}
       */
      value: function namespaceEvent(eventName) {
         return EventEmitter.namespace + '.' + eventName;
      }

      /**
       * Fires an event
       *
       * @param {string} eventName The name of the event
       * @param {HTMLElement|Document} element The element on which the event is dispatched
       * @param {Object} [properties={}] A set of key-values to assign to the event
       */

   }, {
      key: 'fireEvent',
      value: function fireEvent(eventName, element) {
         var properties = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

         var customEvent = document.createEvent('Event');

         customEvent.initEvent(eventName, true, true);

         Object.getOwnPropertyNames(properties).forEach(function (property) {
            customEvent[property] = properties[property];

            // Internet Explorer and some older versions of other browsers don't throw
            // a TypeError when trying to assign a value to a read-only property.
            // To keep the behavior consistent, I check that the value is actually
            // changed. If the value is not changed, the expected TypeError is thrown.
            if (customEvent[property] !== properties[property]) {
               throw new TypeError('Cannot set a property which has only a getter');
            }
         });

         element.dispatchEvent(customEvent);
      }
   }]);

   return EventEmitter;
}();

exports.default = EventEmitter;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The class representing an object to store data
 *
 * @class
 */
var Store = function () {

  /**
   * Creates a new Store object
   *
   * @param {string} namespace The namespace to use to store the data
   */
  function Store(namespace) {
    _classCallCheck(this, Store);

    this.namespace = namespace;
  }

  /**
   * Gets the value of the required property for a given object.
   * If <code>property</code> is not provided, an object containing all
   * the data set is returned.
   *
   * @param {Object} object The object whose value is returned
   * @param {string} [property] The name of the property whose value is returned
   *
   * @return {*}
   */


  _createClass(Store, [{
    key: "getData",
    value: function getData(object, property) {
      return object[this.namespace] && property ? object[this.namespace][property] : object[this.namespace];
    }

    /**
     * Sets the value of the required property for a given object.
     * If <code>property</code> is an object, all its key-value pairs are set.
     *
     * @param {Object} object The object whose value is set
     * @param {*} [value] The value to set
     *
     * @return Store
     */

  }, {
    key: "setData",
    value: function setData(object, value) {
      if (!object[this.namespace]) {
        object[this.namespace] = {};
      }

      object[this.namespace] = value;

      return this;
    }

    /**
     * Removes all the data from a given object
     *
     * @param {Object} object The object whose data are removed
     *
     * @return Store
     */

  }, {
    key: "removeData",
    value: function removeData(object) {
      delete object[this.namespace];

      return this;
    }
  }]);

  return Store;
}();

exports.default = Store;
module.exports = exports["default"];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The class representing an object to manage the style of an element
 *
 * @class
 */
var Style = function () {
   function Style() {
      _classCallCheck(this, Style);
   }

   _createClass(Style, null, [{
      key: 'resetStyleProperties',

      /**
       * Resets the style of the properties specifies
       *
       * @param {CSSStyleDeclaration} style The object whose properties values are reset
       * @param {string[]} properties The properties to reset
       */
      value: function resetStyleProperties(style, properties) {
         properties.forEach(function (property) {
            style[property] = '';
         });
      }

      /**
       * Copies the properties' values of a CSSStyleDeclaration object into another.
       * If an array of properties is specified, only those properties' values are copied
       *
       * @param {CSSStyleDeclaration} style The object in which to copy the values
       * @param {CSSStyleDeclaration} blueprintStyle The object whose values are copied
       * @param {string[]} [properties] The properties to copy
       */

   }, {
      key: 'copyStyleProperties',
      value: function copyStyleProperties(style, blueprintStyle) {
         var properties = arguments.length <= 2 || arguments[2] === undefined ? Object.keys(blueprintStyle) : arguments[2];

         properties.forEach(function (property) {
            style[property] = blueprintStyle[property];
         });
      }
   }]);

   return Style;
}();

exports.default = Style;
module.exports = exports['default'];

},{}]},{},[2])(2)
});
