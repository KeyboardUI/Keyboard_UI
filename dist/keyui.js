(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v5.2.6
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function () {
	  /*
	   * bail out if there is no document or window
	   * (i.e. in a node/non-DOM environment)
	   *
	   * Return a stubbed API instead
	   */
	  if (typeof document === 'undefined' || typeof window === 'undefined') {
	    return {
	      // always return "initial" because no interaction will ever be detected
	      ask: function ask() {
	        return 'initial';
	      },

	      // always return null
	      element: function element() {
	        return null;
	      },

	      // no-op
	      ignoreKeys: function ignoreKeys() {},

	      // no-op
	      specificKeys: function specificKeys() {},

	      // no-op
	      registerOnChange: function registerOnChange() {},

	      // no-op
	      unRegisterOnChange: function unRegisterOnChange() {}
	    };
	  }

	  /*
	   * variables
	   */

	  // cache document.documentElement
	  var docElem = document.documentElement;

	  // currently focused dom element
	  var currentElement = null;

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = currentInput;

	  // UNIX timestamp of current event
	  var currentTimestamp = Date.now();

	  // check for a `data-whatpersist` attribute on either the `html` or `body` elements, defaults to `true`
	  var shouldPersist = 'false';

	  // form input types
	  var formInputs = ['button', 'input', 'select', 'textarea'];

	  // empty array for holding callback functions
	  var functionList = [];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [16, // shift
	  17, // control
	  18, // alt
	  91, // Windows key / left Apple cmd
	  93 // Windows menu / right Apple cmd
	  ];

	  var specificMap = [];

	  // mapping of events to input types
	  var inputMap = {
	    keydown: 'keyboard',
	    keyup: 'keyboard',
	    mousedown: 'mouse',
	    mousemove: 'mouse',
	    MSPointerDown: 'pointer',
	    MSPointerMove: 'pointer',
	    pointerdown: 'pointer',
	    pointermove: 'pointer',
	    touchstart: 'touch',
	    touchend: 'touch'

	    // boolean: true if the page is being scrolled
	  };var isScrolling = false;

	  // store current mouse position
	  var mousePos = {
	    x: null,
	    y: null

	    // map of IE 10 pointer events
	  };var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'

	    // check support for passive event listeners
	  };var supportsPassive = false;

	  try {
	    var opts = Object.defineProperty({}, 'passive', {
	      get: function get() {
	        supportsPassive = true;
	      }
	    });

	    window.addEventListener('test', null, opts);
	  } catch (e) {}
	  // fail silently


	  /*
	   * set up
	   */

	  var setUp = function setUp() {
	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	  };

	  /*
	   * events
	   */

	  var addListeners = function addListeners() {
	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately
	    var options = supportsPassive ? { passive: true } : false;

	    document.addEventListener('DOMContentLoaded', setPersist);

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      window.addEventListener('pointerdown', setInput);
	      window.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      window.addEventListener('MSPointerDown', setInput);
	      window.addEventListener('MSPointerMove', setIntent);
	    } else {
	      // mouse events
	      window.addEventListener('mousedown', setInput);
	      window.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        window.addEventListener('touchstart', setInput, options);
	        window.addEventListener('touchend', setInput);
	      }
	    }

	    // mouse wheel
	    window.addEventListener(detectWheel(), setIntent, options);

	    // keyboard events
	    window.addEventListener('keydown', setInput);
	    window.addEventListener('keyup', setInput);

	    // focus events
	    window.addEventListener('focusin', setElement);
	    window.addEventListener('focusout', clearElement);
	  };

	  // checks if input persistence should happen and
	  // get saved state from session storage if true (defaults to `false`)
	  var setPersist = function setPersist() {
	    shouldPersist = !(docElem.getAttribute('data-whatpersist') || document.body.getAttribute('data-whatpersist') === 'false');

	    if (shouldPersist) {
	      // check for session variables and use if available
	      try {
	        if (window.sessionStorage.getItem('what-input')) {
	          currentInput = window.sessionStorage.getItem('what-input');
	        }

	        if (window.sessionStorage.getItem('what-intent')) {
	          currentIntent = window.sessionStorage.getItem('what-intent');
	        }
	      } catch (e) {
	        // fail silently
	      }
	    }
	    // always run these so at least `initial` state is set
	    doUpdate('input');
	    doUpdate('intent');
	  };

	  // checks conditions before updating new input
	  var setInput = function setInput(event) {
	    var eventKey = event.which;
	    var value = inputMap[event.type];

	    if (value === 'pointer') {
	      value = pointerType(event);
	    }

	    var ignoreMatch = !specificMap.length && ignoreMap.indexOf(eventKey) === -1;

	    var specificMatch = specificMap.length && specificMap.indexOf(eventKey) !== -1;

	    var shouldUpdate = value === 'keyboard' && eventKey && (ignoreMatch || specificMatch) || value === 'mouse' || value === 'touch';

	    // prevent touch detection from being overridden by event execution order
	    if (validateTouch(value)) {
	      shouldUpdate = false;
	    }
	    doUpdate('input', event.target);

	    if (shouldUpdate && currentInput !== value) {
	      currentInput = value;

	      persistInput('input', event.target);
	      doUpdate('input', event.target);
	    }

	    if (shouldUpdate && currentIntent !== value) {
	      // preserve intent for keyboard interaction with form fields
	      var activeElem = document.activeElement;
	      var notFormInput = activeElem && activeElem.nodeName && (formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1 || activeElem.nodeName.toLowerCase() === 'button' && !checkClosest(activeElem, 'form'));

	      if (notFormInput) {
	        currentIntent = value;

	        persistInput('intent', currentIntent);
	        doUpdate('intent', event.target);
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var doUpdate = function doUpdate(which, target) {
	    docElem.setAttribute('data-what' + which, which === 'input' ? currentInput : currentIntent);
	    if (target !== undefined) {
	      target.setAttribute('data-what' + which, which === 'input' ? currentInput : currentIntent);
	    }

	    fireFunctions(which);
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function setIntent(event) {
	    var value = inputMap[event.type];

	    if (value === 'pointer') {
	      value = pointerType(event);
	    }

	    // test to see if `mousemove` happened relative to the screen to detect scrolling versus mousemove
	    detectScrolling(event);

	    // only execute if scrolling isn't happening
	    if ((!isScrolling && !validateTouch(value) || isScrolling && event.type === 'wheel' || event.type === 'mousewheel' || event.type === 'DOMMouseScroll') && currentIntent !== value) {
	      currentIntent = value;
	      persistInput('intent', currentIntent);
	      doUpdate('intent');
	    }
	  };

	  var setElement = function setElement(event) {
	    if (!event.target.nodeName) {
	      // If nodeName is undefined, clear the element
	      // This can happen if click inside an <svg> element.
	      clearElement();
	      return;
	    }

	    currentElement = event.target.nodeName.toLowerCase();
	    docElem.setAttribute('data-whatelement', currentElement);

	    if (event.target.classList && event.target.classList.length) {
	      docElem.setAttribute('data-whatclasses', event.target.classList.toString().replace(' ', ','));
	    }
	  };

	  var clearElement = function clearElement() {
	    currentElement = null;

	    docElem.removeAttribute('data-whatelement');
	    docElem.removeAttribute('data-whatclasses');
	  };

	  var persistInput = function persistInput(which, value) {
	    if (shouldPersist) {
	      try {
	        window.sessionStorage.setItem('what-' + which, value);
	      } catch (e) {
	        // fail silently
	      }
	    }
	  };

	  /*
	   * utilities
	   */

	  var pointerType = function pointerType(event) {
	    if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	    } else {
	      // treat pen like touch
	      return event.pointerType === 'pen' ? 'touch' : event.pointerType;
	    }
	  };

	  // prevent touch detection from being overridden by event execution order
	  var validateTouch = function validateTouch(value) {
	    var timestamp = Date.now();

	    var touchIsValid = value === 'mouse' && currentInput === 'touch' && timestamp - currentTimestamp < 200;

	    currentTimestamp = timestamp;

	    return touchIsValid;
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
	  var detectWheel = function detectWheel() {
	    var wheelType = null;

	    // Modern browsers support "wheel"
	    if ('onwheel' in document.createElement('div')) {
	      wheelType = 'wheel';
	    } else {
	      // Webkit and IE support at least "mousewheel"
	      // or assume that remaining browsers are older Firefox
	      wheelType = document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
	    }

	    return wheelType;
	  };

	  // runs callback functions
	  var fireFunctions = function fireFunctions(type) {
	    for (var i = 0, len = functionList.length; i < len; i++) {
	      if (functionList[i].type === type) {
	        functionList[i].fn.call(undefined, type === 'input' ? currentInput : currentIntent);
	      }
	    }
	  };

	  // finds matching element in an object
	  var objPos = function objPos(match) {
	    for (var i = 0, len = functionList.length; i < len; i++) {
	      if (functionList[i].fn === match) {
	        return i;
	      }
	    }
	  };

	  var detectScrolling = function detectScrolling(event) {
	    if (mousePos.x !== event.screenX || mousePos.y !== event.screenY) {
	      isScrolling = false;

	      mousePos.x = event.screenX;
	      mousePos.y = event.screenY;
	    } else {
	      isScrolling = true;
	    }
	  };

	  // manual version of `closest()`
	  var checkClosest = function checkClosest(elem, tag) {
	    var ElementPrototype = window.Element.prototype;

	    if (!ElementPrototype.matches) {
	      ElementPrototype.matches = ElementPrototype.msMatchesSelector || ElementPrototype.webkitMatchesSelector;
	    }

	    if (!ElementPrototype.closest) {
	      do {
	        if (elem.matches(tag)) {
	          return elem;
	        }

	        elem = elem.parentElement || elem.parentNode;
	      } while (elem !== null && elem.nodeType === 1);

	      return null;
	    } else {
	      return elem.closest(tag);
	    }
	  };

	  /*
	   * init
	   */

	  // don't start script unless browser cuts the mustard
	  // (also passes if polyfills are used)
	  if ('addEventListener' in window && Array.prototype.indexOf) {
	    setUp();
	  }

	  /*
	   * api
	   */

	  return {
	    // returns string: the current input type
	    // opt: 'intent'|'input'
	    // 'input' (default): returns the same value as the `data-whatinput` attribute
	    // 'intent': includes `data-whatintent` value if it's different than `data-whatinput`
	    ask: function ask(opt) {
	      return opt === 'intent' ? currentIntent : currentInput;
	    },

	    // returns string: the currently focused element or null
	    element: function element() {
	      return currentElement;
	    },

	    // overwrites ignored keys with provided array
	    ignoreKeys: function ignoreKeys(arr) {
	      ignoreMap = arr;
	    },

	    // overwrites specific char keys to update on
	    specificKeys: function specificKeys(arr) {
	      specificMap = arr;
	    },

	    // attach functions to input and intent "events"
	    // funct: function to fire on change
	    // eventType: 'input'|'intent'
	    registerOnChange: function registerOnChange(fn, eventType) {
	      functionList.push({
	        fn: fn,
	        type: eventType || 'input'
	      });
	    },

	    unRegisterOnChange: function unRegisterOnChange(fn) {
	      var position = objPos(fn);

	      if (position || position === 0) {
	        functionList.splice(position, 1);
	      }
	    },

	    clearStorage: function clearStorage() {
	      window.sessionStorage.clear();
	    }
	  };
	}();

/***/ })
/******/ ])
});
;
},{}],2:[function(require,module,exports){
"use strict";

var _whatInput = require("what-input");

var _whatInput2 = _interopRequireDefault(_whatInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener("click", function (e) {
  if (_whatInput2.default.ask() === "mouse") {
    if (e.target.tagName === "BUTTON") e.target.blur();
  }
});

},{"what-input":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd2hhdC1pbnB1dC9kaXN0L3doYXQtaW5wdXQuanMiLCJzcmMva2V5dWkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0Z0JBOzs7Ozs7QUFFQSxTQUFTLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLGFBQUs7QUFDdEMsTUFBSSxvQkFBVSxHQUFWLE9BQW9CLE9BQXhCLEVBQWlDO0FBQy9CLFFBQUksRUFBRSxNQUFGLENBQVMsT0FBVCxLQUFxQixRQUF6QixFQUFtQyxFQUFFLE1BQUYsQ0FBUyxJQUFUO0FBQ3BDO0FBQ0YsQ0FKRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogd2hhdC1pbnB1dCAtIEEgZ2xvYmFsIHV0aWxpdHkgZm9yIHRyYWNraW5nIHRoZSBjdXJyZW50IGlucHV0IG1ldGhvZCAobW91c2UsIGtleWJvYXJkIG9yIHRvdWNoKS5cbiAqIEB2ZXJzaW9uIHY1LjIuNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3RlbjFzZXZlbi93aGF0LWlucHV0XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ3aGF0SW5wdXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHQgIC8qXHJcblx0ICAgKiBiYWlsIG91dCBpZiB0aGVyZSBpcyBubyBkb2N1bWVudCBvciB3aW5kb3dcclxuXHQgICAqIChpLmUuIGluIGEgbm9kZS9ub24tRE9NIGVudmlyb25tZW50KVxyXG5cdCAgICpcclxuXHQgICAqIFJldHVybiBhIHN0dWJiZWQgQVBJIGluc3RlYWRcclxuXHQgICAqL1xuXHQgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG5cdCAgICByZXR1cm4ge1xuXHQgICAgICAvLyBhbHdheXMgcmV0dXJuIFwiaW5pdGlhbFwiIGJlY2F1c2Ugbm8gaW50ZXJhY3Rpb24gd2lsbCBldmVyIGJlIGRldGVjdGVkXG5cdCAgICAgIGFzazogZnVuY3Rpb24gYXNrKCkge1xuXHQgICAgICAgIHJldHVybiAnaW5pdGlhbCc7XG5cdCAgICAgIH0sXG5cblx0ICAgICAgLy8gYWx3YXlzIHJldHVybiBudWxsXG5cdCAgICAgIGVsZW1lbnQ6IGZ1bmN0aW9uIGVsZW1lbnQoKSB7XG5cdCAgICAgICAgcmV0dXJuIG51bGw7XG5cdCAgICAgIH0sXG5cblx0ICAgICAgLy8gbm8tb3Bcblx0ICAgICAgaWdub3JlS2V5czogZnVuY3Rpb24gaWdub3JlS2V5cygpIHt9LFxuXG5cdCAgICAgIC8vIG5vLW9wXG5cdCAgICAgIHNwZWNpZmljS2V5czogZnVuY3Rpb24gc3BlY2lmaWNLZXlzKCkge30sXG5cblx0ICAgICAgLy8gbm8tb3Bcblx0ICAgICAgcmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gcmVnaXN0ZXJPbkNoYW5nZSgpIHt9LFxuXG5cdCAgICAgIC8vIG5vLW9wXG5cdCAgICAgIHVuUmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gdW5SZWdpc3Rlck9uQ2hhbmdlKCkge31cblx0ICAgIH07XG5cdCAgfVxuXG5cdCAgLypcclxuXHQgICAqIHZhcmlhYmxlc1xyXG5cdCAgICovXG5cblx0ICAvLyBjYWNoZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblx0ICB2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHQgIC8vIGN1cnJlbnRseSBmb2N1c2VkIGRvbSBlbGVtZW50XG5cdCAgdmFyIGN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG5cdCAgdmFyIGN1cnJlbnRJbnB1dCA9ICdpbml0aWFsJztcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCBpbnRlbnRcblx0ICB2YXIgY3VycmVudEludGVudCA9IGN1cnJlbnRJbnB1dDtcblxuXHQgIC8vIFVOSVggdGltZXN0YW1wIG9mIGN1cnJlbnQgZXZlbnRcblx0ICB2YXIgY3VycmVudFRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cblx0ICAvLyBjaGVjayBmb3IgYSBgZGF0YS13aGF0cGVyc2lzdGAgYXR0cmlidXRlIG9uIGVpdGhlciB0aGUgYGh0bWxgIG9yIGBib2R5YCBlbGVtZW50cywgZGVmYXVsdHMgdG8gYHRydWVgXG5cdCAgdmFyIHNob3VsZFBlcnNpc3QgPSAnZmFsc2UnO1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gWydidXR0b24nLCAnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJ107XG5cblx0ICAvLyBlbXB0eSBhcnJheSBmb3IgaG9sZGluZyBjYWxsYmFjayBmdW5jdGlvbnNcblx0ICB2YXIgZnVuY3Rpb25MaXN0ID0gW107XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gWzE2LCAvLyBzaGlmdFxuXHQgIDE3LCAvLyBjb250cm9sXG5cdCAgMTgsIC8vIGFsdFxuXHQgIDkxLCAvLyBXaW5kb3dzIGtleSAvIGxlZnQgQXBwbGUgY21kXG5cdCAgOTMgLy8gV2luZG93cyBtZW51IC8gcmlnaHQgQXBwbGUgY21kXG5cdCAgXTtcblxuXHQgIHZhciBzcGVjaWZpY01hcCA9IFtdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICBrZXlkb3duOiAna2V5Ym9hcmQnLFxuXHQgICAga2V5dXA6ICdrZXlib2FyZCcsXG5cdCAgICBtb3VzZWRvd246ICdtb3VzZScsXG5cdCAgICBtb3VzZW1vdmU6ICdtb3VzZScsXG5cdCAgICBNU1BvaW50ZXJEb3duOiAncG9pbnRlcicsXG5cdCAgICBNU1BvaW50ZXJNb3ZlOiAncG9pbnRlcicsXG5cdCAgICBwb2ludGVyZG93bjogJ3BvaW50ZXInLFxuXHQgICAgcG9pbnRlcm1vdmU6ICdwb2ludGVyJyxcblx0ICAgIHRvdWNoc3RhcnQ6ICd0b3VjaCcsXG5cdCAgICB0b3VjaGVuZDogJ3RvdWNoJ1xuXG5cdCAgICAvLyBib29sZWFuOiB0cnVlIGlmIHRoZSBwYWdlIGlzIGJlaW5nIHNjcm9sbGVkXG5cdCAgfTt2YXIgaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuXHQgIC8vIHN0b3JlIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cblx0ICB2YXIgbW91c2VQb3MgPSB7XG5cdCAgICB4OiBudWxsLFxuXHQgICAgeTogbnVsbFxuXG5cdCAgICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcblx0ICB9O3ZhciBwb2ludGVyTWFwID0ge1xuXHQgICAgMjogJ3RvdWNoJyxcblx0ICAgIDM6ICd0b3VjaCcsIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICA0OiAnbW91c2UnXG5cblx0ICAgIC8vIGNoZWNrIHN1cHBvcnQgZm9yIHBhc3NpdmUgZXZlbnQgbGlzdGVuZXJzXG5cdCAgfTt2YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cblx0ICB0cnkge1xuXHQgICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuXHQgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0ICAgICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuXHQgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcblx0ICB9IGNhdGNoIChlKSB7fVxuXHQgIC8vIGZhaWwgc2lsZW50bHlcblxuXG5cdCAgLypcclxuXHQgICAqIHNldCB1cFxyXG5cdCAgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbiBzZXRVcCgpIHtcblx0ICAgIC8vIGFkZCBjb3JyZWN0IG1vdXNlIHdoZWVsIGV2ZW50IG1hcHBpbmcgdG8gYGlucHV0TWFwYFxuXHQgICAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG5cdCAgICBhZGRMaXN0ZW5lcnMoKTtcblx0ICB9O1xuXG5cdCAgLypcclxuXHQgICAqIGV2ZW50c1xyXG5cdCAgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCkge1xuXHQgICAgLy8gYHBvaW50ZXJtb3ZlYCwgYE1TUG9pbnRlck1vdmVgLCBgbW91c2Vtb3ZlYCBhbmQgbW91c2Ugd2hlZWwgZXZlbnQgYmluZGluZ1xuXHQgICAgLy8gY2FuIG9ubHkgZGVtb25zdHJhdGUgcG90ZW50aWFsLCBidXQgbm90IGFjdHVhbCwgaW50ZXJhY3Rpb25cblx0ICAgIC8vIGFuZCBhcmUgdHJlYXRlZCBzZXBhcmF0ZWx5XG5cdCAgICB2YXIgb3B0aW9ucyA9IHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2U7XG5cblx0ICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBzZXRQZXJzaXN0KTtcblxuXHQgICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuXHQgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcblx0ICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgc2V0SW5wdXQpO1xuXHQgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcblx0ICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCBzZXRJbnB1dCk7XG5cdCAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIG1vdXNlIGV2ZW50c1xuXHQgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc2V0SW5wdXQpO1xuXHQgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0SW50ZW50KTtcblxuXHQgICAgICAvLyB0b3VjaCBldmVudHNcblx0ICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuXHQgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc2V0SW5wdXQsIG9wdGlvbnMpO1xuXHQgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHNldElucHV0KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBtb3VzZSB3aGVlbFxuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZGV0ZWN0V2hlZWwoKSwgc2V0SW50ZW50LCBvcHRpb25zKTtcblxuXHQgICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG5cdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNldElucHV0KTtcblx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHNldElucHV0KTtcblxuXHQgICAgLy8gZm9jdXMgZXZlbnRzXG5cdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIHNldEVsZW1lbnQpO1xuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgY2xlYXJFbGVtZW50KTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGlmIGlucHV0IHBlcnNpc3RlbmNlIHNob3VsZCBoYXBwZW4gYW5kXG5cdCAgLy8gZ2V0IHNhdmVkIHN0YXRlIGZyb20gc2Vzc2lvbiBzdG9yYWdlIGlmIHRydWUgKGRlZmF1bHRzIHRvIGBmYWxzZWApXG5cdCAgdmFyIHNldFBlcnNpc3QgPSBmdW5jdGlvbiBzZXRQZXJzaXN0KCkge1xuXHQgICAgc2hvdWxkUGVyc2lzdCA9ICEoZG9jRWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdHBlcnNpc3QnKSB8fCBkb2N1bWVudC5ib2R5LmdldEF0dHJpYnV0ZSgnZGF0YS13aGF0cGVyc2lzdCcpID09PSAnZmFsc2UnKTtcblxuXHQgICAgaWYgKHNob3VsZFBlcnNpc3QpIHtcblx0ICAgICAgLy8gY2hlY2sgZm9yIHNlc3Npb24gdmFyaWFibGVzIGFuZCB1c2UgaWYgYXZhaWxhYmxlXG5cdCAgICAgIHRyeSB7XG5cdCAgICAgICAgaWYgKHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd3aGF0LWlucHV0JykpIHtcblx0ICAgICAgICAgIGN1cnJlbnRJbnB1dCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd3aGF0LWlucHV0Jyk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgaWYgKHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd3aGF0LWludGVudCcpKSB7XG5cdCAgICAgICAgICBjdXJyZW50SW50ZW50ID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3doYXQtaW50ZW50Jyk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgLy8gZmFpbCBzaWxlbnRseVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgICAvLyBhbHdheXMgcnVuIHRoZXNlIHNvIGF0IGxlYXN0IGBpbml0aWFsYCBzdGF0ZSBpcyBzZXRcblx0ICAgIGRvVXBkYXRlKCdpbnB1dCcpO1xuXHQgICAgZG9VcGRhdGUoJ2ludGVudCcpO1xuXHQgIH07XG5cblx0ICAvLyBjaGVja3MgY29uZGl0aW9ucyBiZWZvcmUgdXBkYXRpbmcgbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24gc2V0SW5wdXQoZXZlbnQpIHtcblx0ICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cblx0ICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB7XG5cdCAgICAgIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXHQgICAgfVxuXG5cdCAgICB2YXIgaWdub3JlTWF0Y2ggPSAhc3BlY2lmaWNNYXAubGVuZ3RoICYmIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA9PT0gLTE7XG5cblx0ICAgIHZhciBzcGVjaWZpY01hdGNoID0gc3BlY2lmaWNNYXAubGVuZ3RoICYmIHNwZWNpZmljTWFwLmluZGV4T2YoZXZlbnRLZXkpICE9PSAtMTtcblxuXHQgICAgdmFyIHNob3VsZFVwZGF0ZSA9IHZhbHVlID09PSAna2V5Ym9hcmQnICYmIGV2ZW50S2V5ICYmIChpZ25vcmVNYXRjaCB8fCBzcGVjaWZpY01hdGNoKSB8fCB2YWx1ZSA9PT0gJ21vdXNlJyB8fCB2YWx1ZSA9PT0gJ3RvdWNoJztcblxuXHQgICAgLy8gcHJldmVudCB0b3VjaCBkZXRlY3Rpb24gZnJvbSBiZWluZyBvdmVycmlkZGVuIGJ5IGV2ZW50IGV4ZWN1dGlvbiBvcmRlclxuXHQgICAgaWYgKHZhbGlkYXRlVG91Y2godmFsdWUpKSB7XG5cdCAgICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXHQgICAgfVxuXHQgICAgZG9VcGRhdGUoJ2lucHV0JywgZXZlbnQudGFyZ2V0KTtcblxuXHQgICAgaWYgKHNob3VsZFVwZGF0ZSAmJiBjdXJyZW50SW5wdXQgIT09IHZhbHVlKSB7XG5cdCAgICAgIGN1cnJlbnRJbnB1dCA9IHZhbHVlO1xuXG5cdCAgICAgIHBlcnNpc3RJbnB1dCgnaW5wdXQnLCBldmVudC50YXJnZXQpO1xuXHQgICAgICBkb1VwZGF0ZSgnaW5wdXQnLCBldmVudC50YXJnZXQpO1xuXHQgICAgfVxuXG5cdCAgICBpZiAoc2hvdWxkVXBkYXRlICYmIGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgIC8vIHByZXNlcnZlIGludGVudCBmb3Iga2V5Ym9hcmQgaW50ZXJhY3Rpb24gd2l0aCBmb3JtIGZpZWxkc1xuXHQgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgIHZhciBub3RGb3JtSW5wdXQgPSBhY3RpdmVFbGVtICYmIGFjdGl2ZUVsZW0ubm9kZU5hbWUgJiYgKGZvcm1JbnB1dHMuaW5kZXhPZihhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID09PSAtMSB8fCBhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdidXR0b24nICYmICFjaGVja0Nsb3Nlc3QoYWN0aXZlRWxlbSwgJ2Zvcm0nKSk7XG5cblx0ICAgICAgaWYgKG5vdEZvcm1JbnB1dCkge1xuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgIHBlcnNpc3RJbnB1dCgnaW50ZW50JywgY3VycmVudEludGVudCk7XG5cdCAgICAgICAgZG9VcGRhdGUoJ2ludGVudCcsIGV2ZW50LnRhcmdldCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyB0aGUgZG9jIGFuZCBgaW5wdXRUeXBlc2AgYXJyYXkgd2l0aCBuZXcgaW5wdXRcblx0ICB2YXIgZG9VcGRhdGUgPSBmdW5jdGlvbiBkb1VwZGF0ZSh3aGljaCwgdGFyZ2V0KSB7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0JyArIHdoaWNoLCB3aGljaCA9PT0gJ2lucHV0JyA/IGN1cnJlbnRJbnB1dCA6IGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdCcgKyB3aGljaCwgd2hpY2ggPT09ICdpbnB1dCcgPyBjdXJyZW50SW5wdXQgOiBjdXJyZW50SW50ZW50KTtcblx0ICAgIH1cblxuXHQgICAgZmlyZUZ1bmN0aW9ucyh3aGljaCk7XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbiBzZXRJbnRlbnQoZXZlbnQpIHtcblx0ICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXG5cdCAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykge1xuXHQgICAgICB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblx0ICAgIH1cblxuXHQgICAgLy8gdGVzdCB0byBzZWUgaWYgYG1vdXNlbW92ZWAgaGFwcGVuZWQgcmVsYXRpdmUgdG8gdGhlIHNjcmVlbiB0byBkZXRlY3Qgc2Nyb2xsaW5nIHZlcnN1cyBtb3VzZW1vdmVcblx0ICAgIGRldGVjdFNjcm9sbGluZyhldmVudCk7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiBzY3JvbGxpbmcgaXNuJ3QgaGFwcGVuaW5nXG5cdCAgICBpZiAoKCFpc1Njcm9sbGluZyAmJiAhdmFsaWRhdGVUb3VjaCh2YWx1ZSkgfHwgaXNTY3JvbGxpbmcgJiYgZXZlbnQudHlwZSA9PT0gJ3doZWVsJyB8fCBldmVudC50eXBlID09PSAnbW91c2V3aGVlbCcgfHwgZXZlbnQudHlwZSA9PT0gJ0RPTU1vdXNlU2Nyb2xsJykgJiYgY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXHQgICAgICBwZXJzaXN0SW5wdXQoJ2ludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICBkb1VwZGF0ZSgnaW50ZW50Jyk7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIHZhciBzZXRFbGVtZW50ID0gZnVuY3Rpb24gc2V0RWxlbWVudChldmVudCkge1xuXHQgICAgaWYgKCFldmVudC50YXJnZXQubm9kZU5hbWUpIHtcblx0ICAgICAgLy8gSWYgbm9kZU5hbWUgaXMgdW5kZWZpbmVkLCBjbGVhciB0aGUgZWxlbWVudFxuXHQgICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gaWYgY2xpY2sgaW5zaWRlIGFuIDxzdmc+IGVsZW1lbnQuXG5cdCAgICAgIGNsZWFyRWxlbWVudCgpO1xuXHQgICAgICByZXR1cm47XG5cdCAgICB9XG5cblx0ICAgIGN1cnJlbnRFbGVtZW50ID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0ZWxlbWVudCcsIGN1cnJlbnRFbGVtZW50KTtcblxuXHQgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QgJiYgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5sZW5ndGgpIHtcblx0ICAgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGNsYXNzZXMnLCBldmVudC50YXJnZXQuY2xhc3NMaXN0LnRvU3RyaW5nKCkucmVwbGFjZSgnICcsICcsJykpO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICB2YXIgY2xlYXJFbGVtZW50ID0gZnVuY3Rpb24gY2xlYXJFbGVtZW50KCkge1xuXHQgICAgY3VycmVudEVsZW1lbnQgPSBudWxsO1xuXG5cdCAgICBkb2NFbGVtLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS13aGF0ZWxlbWVudCcpO1xuXHQgICAgZG9jRWxlbS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtd2hhdGNsYXNzZXMnKTtcblx0ICB9O1xuXG5cdCAgdmFyIHBlcnNpc3RJbnB1dCA9IGZ1bmN0aW9uIHBlcnNpc3RJbnB1dCh3aGljaCwgdmFsdWUpIHtcblx0ICAgIGlmIChzaG91bGRQZXJzaXN0KSB7XG5cdCAgICAgIHRyeSB7XG5cdCAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3doYXQtJyArIHdoaWNoLCB2YWx1ZSk7XG5cdCAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAvLyBmYWlsIHNpbGVudGx5XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLypcclxuXHQgICAqIHV0aWxpdGllc1xyXG5cdCAgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbiBwb2ludGVyVHlwZShldmVudCkge1xuXHQgICAgaWYgKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpIHtcblx0ICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgICAgcmV0dXJuIGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJyA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gcHJldmVudCB0b3VjaCBkZXRlY3Rpb24gZnJvbSBiZWluZyBvdmVycmlkZGVuIGJ5IGV2ZW50IGV4ZWN1dGlvbiBvcmRlclxuXHQgIHZhciB2YWxpZGF0ZVRvdWNoID0gZnVuY3Rpb24gdmFsaWRhdGVUb3VjaCh2YWx1ZSkge1xuXHQgICAgdmFyIHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cblx0ICAgIHZhciB0b3VjaElzVmFsaWQgPSB2YWx1ZSA9PT0gJ21vdXNlJyAmJiBjdXJyZW50SW5wdXQgPT09ICd0b3VjaCcgJiYgdGltZXN0YW1wIC0gY3VycmVudFRpbWVzdGFtcCA8IDIwMDtcblxuXHQgICAgY3VycmVudFRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcblxuXHQgICAgcmV0dXJuIHRvdWNoSXNWYWxpZDtcblx0ICB9O1xuXG5cdCAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG5cdCAgLy8gdmlhIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L3doZWVsX2V2ZW50XG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24gZGV0ZWN0V2hlZWwoKSB7XG5cdCAgICB2YXIgd2hlZWxUeXBlID0gbnVsbDtcblxuXHQgICAgLy8gTW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgXCJ3aGVlbFwiXG5cdCAgICBpZiAoJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSB7XG5cdCAgICAgIHdoZWVsVHlwZSA9ICd3aGVlbCc7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgLy8gb3IgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG5cdCAgICAgIHdoZWVsVHlwZSA9IGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID8gJ21vdXNld2hlZWwnIDogJ0RPTU1vdXNlU2Nyb2xsJztcblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIHdoZWVsVHlwZTtcblx0ICB9O1xuXG5cdCAgLy8gcnVucyBjYWxsYmFjayBmdW5jdGlvbnNcblx0ICB2YXIgZmlyZUZ1bmN0aW9ucyA9IGZ1bmN0aW9uIGZpcmVGdW5jdGlvbnModHlwZSkge1xuXHQgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZ1bmN0aW9uTGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICBpZiAoZnVuY3Rpb25MaXN0W2ldLnR5cGUgPT09IHR5cGUpIHtcblx0ICAgICAgICBmdW5jdGlvbkxpc3RbaV0uZm4uY2FsbCh1bmRlZmluZWQsIHR5cGUgPT09ICdpbnB1dCcgPyBjdXJyZW50SW5wdXQgOiBjdXJyZW50SW50ZW50KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBmaW5kcyBtYXRjaGluZyBlbGVtZW50IGluIGFuIG9iamVjdFxuXHQgIHZhciBvYmpQb3MgPSBmdW5jdGlvbiBvYmpQb3MobWF0Y2gpIHtcblx0ICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmdW5jdGlvbkxpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0ICAgICAgaWYgKGZ1bmN0aW9uTGlzdFtpXS5mbiA9PT0gbWF0Y2gpIHtcblx0ICAgICAgICByZXR1cm4gaTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICB2YXIgZGV0ZWN0U2Nyb2xsaW5nID0gZnVuY3Rpb24gZGV0ZWN0U2Nyb2xsaW5nKGV2ZW50KSB7XG5cdCAgICBpZiAobW91c2VQb3MueCAhPT0gZXZlbnQuc2NyZWVuWCB8fCBtb3VzZVBvcy55ICE9PSBldmVudC5zY3JlZW5ZKSB7XG5cdCAgICAgIGlzU2Nyb2xsaW5nID0gZmFsc2U7XG5cblx0ICAgICAgbW91c2VQb3MueCA9IGV2ZW50LnNjcmVlblg7XG5cdCAgICAgIG1vdXNlUG9zLnkgPSBldmVudC5zY3JlZW5ZO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaXNTY3JvbGxpbmcgPSB0cnVlO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBtYW51YWwgdmVyc2lvbiBvZiBgY2xvc2VzdCgpYFxuXHQgIHZhciBjaGVja0Nsb3Nlc3QgPSBmdW5jdGlvbiBjaGVja0Nsb3Nlc3QoZWxlbSwgdGFnKSB7XG5cdCAgICB2YXIgRWxlbWVudFByb3RvdHlwZSA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZTtcblxuXHQgICAgaWYgKCFFbGVtZW50UHJvdG90eXBlLm1hdGNoZXMpIHtcblx0ICAgICAgRWxlbWVudFByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudFByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50UHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3Rvcjtcblx0ICAgIH1cblxuXHQgICAgaWYgKCFFbGVtZW50UHJvdG90eXBlLmNsb3Nlc3QpIHtcblx0ICAgICAgZG8ge1xuXHQgICAgICAgIGlmIChlbGVtLm1hdGNoZXModGFnKSkge1xuXHQgICAgICAgICAgcmV0dXJuIGVsZW07XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgZWxlbSA9IGVsZW0ucGFyZW50RWxlbWVudCB8fCBlbGVtLnBhcmVudE5vZGU7XG5cdCAgICAgIH0gd2hpbGUgKGVsZW0gIT09IG51bGwgJiYgZWxlbS5ub2RlVHlwZSA9PT0gMSk7XG5cblx0ICAgICAgcmV0dXJuIG51bGw7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICByZXR1cm4gZWxlbS5jbG9zZXN0KHRhZyk7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8qXHJcblx0ICAgKiBpbml0XHJcblx0ICAgKi9cblxuXHQgIC8vIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgLy8gKGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZClcblx0ICBpZiAoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuXHQgICAgc2V0VXAoKTtcblx0ICB9XG5cblx0ICAvKlxyXG5cdCAgICogYXBpXHJcblx0ICAgKi9cblxuXHQgIHJldHVybiB7XG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuXHQgICAgLy8gb3B0OiAnaW50ZW50J3wnaW5wdXQnXG5cdCAgICAvLyAnaW5wdXQnIChkZWZhdWx0KTogcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgYGRhdGEtd2hhdGlucHV0YCBhdHRyaWJ1dGVcblx0ICAgIC8vICdpbnRlbnQnOiBpbmNsdWRlcyBgZGF0YS13aGF0aW50ZW50YCB2YWx1ZSBpZiBpdCdzIGRpZmZlcmVudCB0aGFuIGBkYXRhLXdoYXRpbnB1dGBcblx0ICAgIGFzazogZnVuY3Rpb24gYXNrKG9wdCkge1xuXHQgICAgICByZXR1cm4gb3B0ID09PSAnaW50ZW50JyA/IGN1cnJlbnRJbnRlbnQgOiBjdXJyZW50SW5wdXQ7XG5cdCAgICB9LFxuXG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnQgb3IgbnVsbFxuXHQgICAgZWxlbWVudDogZnVuY3Rpb24gZWxlbWVudCgpIHtcblx0ICAgICAgcmV0dXJuIGN1cnJlbnRFbGVtZW50O1xuXHQgICAgfSxcblxuXHQgICAgLy8gb3ZlcndyaXRlcyBpZ25vcmVkIGtleXMgd2l0aCBwcm92aWRlZCBhcnJheVxuXHQgICAgaWdub3JlS2V5czogZnVuY3Rpb24gaWdub3JlS2V5cyhhcnIpIHtcblx0ICAgICAgaWdub3JlTWFwID0gYXJyO1xuXHQgICAgfSxcblxuXHQgICAgLy8gb3ZlcndyaXRlcyBzcGVjaWZpYyBjaGFyIGtleXMgdG8gdXBkYXRlIG9uXG5cdCAgICBzcGVjaWZpY0tleXM6IGZ1bmN0aW9uIHNwZWNpZmljS2V5cyhhcnIpIHtcblx0ICAgICAgc3BlY2lmaWNNYXAgPSBhcnI7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBhdHRhY2ggZnVuY3Rpb25zIHRvIGlucHV0IGFuZCBpbnRlbnQgXCJldmVudHNcIlxuXHQgICAgLy8gZnVuY3Q6IGZ1bmN0aW9uIHRvIGZpcmUgb24gY2hhbmdlXG5cdCAgICAvLyBldmVudFR5cGU6ICdpbnB1dCd8J2ludGVudCdcblx0ICAgIHJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHJlZ2lzdGVyT25DaGFuZ2UoZm4sIGV2ZW50VHlwZSkge1xuXHQgICAgICBmdW5jdGlvbkxpc3QucHVzaCh7XG5cdCAgICAgICAgZm46IGZuLFxuXHQgICAgICAgIHR5cGU6IGV2ZW50VHlwZSB8fCAnaW5wdXQnXG5cdCAgICAgIH0pO1xuXHQgICAgfSxcblxuXHQgICAgdW5SZWdpc3Rlck9uQ2hhbmdlOiBmdW5jdGlvbiB1blJlZ2lzdGVyT25DaGFuZ2UoZm4pIHtcblx0ICAgICAgdmFyIHBvc2l0aW9uID0gb2JqUG9zKGZuKTtcblxuXHQgICAgICBpZiAocG9zaXRpb24gfHwgcG9zaXRpb24gPT09IDApIHtcblx0ICAgICAgICBmdW5jdGlvbkxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcblx0ICAgICAgfVxuXHQgICAgfSxcblxuXHQgICAgY2xlYXJTdG9yYWdlOiBmdW5jdGlvbiBjbGVhclN0b3JhZ2UoKSB7XG5cdCAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuXHQgICAgfVxuXHQgIH07XG5cdH0oKTtcblxuLyoqKi8gfSlcbi8qKioqKiovIF0pXG59KTtcbjsiLCJpbXBvcnQgd2hhdElucHV0IGZyb20gXCJ3aGF0LWlucHV0XCI7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgaWYgKHdoYXRJbnB1dC5hc2soKSA9PT0gXCJtb3VzZVwiKSB7XHJcbiAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gXCJCVVRUT05cIikgZS50YXJnZXQuYmx1cigpO1xyXG4gIH1cclxufSk7XHJcbiJdfQ==
