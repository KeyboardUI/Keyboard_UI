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
	    console.log(which, target);
	    docElem.setAttribute('data-what' + which, which === 'input' ? currentInput : currentIntent);
	    if (target !== undefined) {
	      console.log('SET', currentInput, currentIntent, which);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd2hhdC1pbnB1dC9kaXN0L3doYXQtaW5wdXQuanMiLCJzcmMva2V5dWkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeGdCQTs7Ozs7O0FBRUEsU0FBUyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxhQUFLO0FBQ3RDLE1BQUksb0JBQVUsR0FBVixPQUFvQixPQUF4QixFQUFpQztBQUMvQixRQUFJLEVBQUUsTUFBRixDQUFTLE9BQVQsS0FBcUIsUUFBekIsRUFBbUMsRUFBRSxNQUFGLENBQVMsSUFBVDtBQUNwQztBQUNGLENBSkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIHdoYXQtaW5wdXQgLSBBIGdsb2JhbCB1dGlsaXR5IGZvciB0cmFja2luZyB0aGUgY3VycmVudCBpbnB1dCBtZXRob2QgKG1vdXNlLCBrZXlib2FyZCBvciB0b3VjaCkuXG4gKiBAdmVyc2lvbiB2NS4yLjZcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW4xc2V2ZW4vd2hhdC1pbnB1dFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwid2hhdElucHV0XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0ICAvKlxyXG5cdCAgICogYmFpbCBvdXQgaWYgdGhlcmUgaXMgbm8gZG9jdW1lbnQgb3Igd2luZG93XHJcblx0ICAgKiAoaS5lLiBpbiBhIG5vZGUvbm9uLURPTSBlbnZpcm9ubWVudClcclxuXHQgICAqXHJcblx0ICAgKiBSZXR1cm4gYSBzdHViYmVkIEFQSSBpbnN0ZWFkXHJcblx0ICAgKi9cblx0ICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuXHQgICAgcmV0dXJuIHtcblx0ICAgICAgLy8gYWx3YXlzIHJldHVybiBcImluaXRpYWxcIiBiZWNhdXNlIG5vIGludGVyYWN0aW9uIHdpbGwgZXZlciBiZSBkZXRlY3RlZFxuXHQgICAgICBhc2s6IGZ1bmN0aW9uIGFzaygpIHtcblx0ICAgICAgICByZXR1cm4gJ2luaXRpYWwnO1xuXHQgICAgICB9LFxuXG5cdCAgICAgIC8vIGFsd2F5cyByZXR1cm4gbnVsbFxuXHQgICAgICBlbGVtZW50OiBmdW5jdGlvbiBlbGVtZW50KCkge1xuXHQgICAgICAgIHJldHVybiBudWxsO1xuXHQgICAgICB9LFxuXG5cdCAgICAgIC8vIG5vLW9wXG5cdCAgICAgIGlnbm9yZUtleXM6IGZ1bmN0aW9uIGlnbm9yZUtleXMoKSB7fSxcblxuXHQgICAgICAvLyBuby1vcFxuXHQgICAgICBzcGVjaWZpY0tleXM6IGZ1bmN0aW9uIHNwZWNpZmljS2V5cygpIHt9LFxuXG5cdCAgICAgIC8vIG5vLW9wXG5cdCAgICAgIHJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHJlZ2lzdGVyT25DaGFuZ2UoKSB7fSxcblxuXHQgICAgICAvLyBuby1vcFxuXHQgICAgICB1blJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHVuUmVnaXN0ZXJPbkNoYW5nZSgpIHt9XG5cdCAgICB9O1xuXHQgIH1cblxuXHQgIC8qXHJcblx0ICAgKiB2YXJpYWJsZXNcclxuXHQgICAqL1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBjdXJyZW50bHkgZm9jdXNlZCBkb20gZWxlbWVudFxuXHQgIHZhciBjdXJyZW50RWxlbWVudCA9IG51bGw7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBjdXJyZW50SW5wdXQ7XG5cblx0ICAvLyBVTklYIHRpbWVzdGFtcCBvZiBjdXJyZW50IGV2ZW50XG5cdCAgdmFyIGN1cnJlbnRUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuXG5cdCAgLy8gY2hlY2sgZm9yIGEgYGRhdGEtd2hhdHBlcnNpc3RgIGF0dHJpYnV0ZSBvbiBlaXRoZXIgdGhlIGBodG1sYCBvciBgYm9keWAgZWxlbWVudHMsIGRlZmF1bHRzIHRvIGB0cnVlYFxuXHQgIHZhciBzaG91bGRQZXJzaXN0ID0gJ2ZhbHNlJztcblxuXHQgIC8vIGZvcm0gaW5wdXQgdHlwZXNcblx0ICB2YXIgZm9ybUlucHV0cyA9IFsnYnV0dG9uJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYSddO1xuXG5cdCAgLy8gZW1wdHkgYXJyYXkgZm9yIGhvbGRpbmcgY2FsbGJhY2sgZnVuY3Rpb25zXG5cdCAgdmFyIGZ1bmN0aW9uTGlzdCA9IFtdO1xuXG5cdCAgLy8gbGlzdCBvZiBtb2RpZmllciBrZXlzIGNvbW1vbmx5IHVzZWQgd2l0aCB0aGUgbW91c2UgYW5kXG5cdCAgLy8gY2FuIGJlIHNhZmVseSBpZ25vcmVkIHRvIHByZXZlbnQgZmFsc2Uga2V5Ym9hcmQgZGV0ZWN0aW9uXG5cdCAgdmFyIGlnbm9yZU1hcCA9IFsxNiwgLy8gc2hpZnRcblx0ICAxNywgLy8gY29udHJvbFxuXHQgIDE4LCAvLyBhbHRcblx0ICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuXHQgIDkzIC8vIFdpbmRvd3MgbWVudSAvIHJpZ2h0IEFwcGxlIGNtZFxuXHQgIF07XG5cblx0ICB2YXIgc3BlY2lmaWNNYXAgPSBbXTtcblxuXHQgIC8vIG1hcHBpbmcgb2YgZXZlbnRzIHRvIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0TWFwID0ge1xuXHQgICAga2V5ZG93bjogJ2tleWJvYXJkJyxcblx0ICAgIGtleXVwOiAna2V5Ym9hcmQnLFxuXHQgICAgbW91c2Vkb3duOiAnbW91c2UnLFxuXHQgICAgbW91c2Vtb3ZlOiAnbW91c2UnLFxuXHQgICAgTVNQb2ludGVyRG93bjogJ3BvaW50ZXInLFxuXHQgICAgTVNQb2ludGVyTW92ZTogJ3BvaW50ZXInLFxuXHQgICAgcG9pbnRlcmRvd246ICdwb2ludGVyJyxcblx0ICAgIHBvaW50ZXJtb3ZlOiAncG9pbnRlcicsXG5cdCAgICB0b3VjaHN0YXJ0OiAndG91Y2gnLFxuXHQgICAgdG91Y2hlbmQ6ICd0b3VjaCdcblxuXHQgICAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0aGUgcGFnZSBpcyBiZWluZyBzY3JvbGxlZFxuXHQgIH07dmFyIGlzU2Nyb2xsaW5nID0gZmFsc2U7XG5cblx0ICAvLyBzdG9yZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXG5cdCAgdmFyIG1vdXNlUG9zID0ge1xuXHQgICAgeDogbnVsbCxcblx0ICAgIHk6IG51bGxcblxuXHQgICAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgfTt2YXIgcG9pbnRlck1hcCA9IHtcblx0ICAgIDI6ICd0b3VjaCcsXG5cdCAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgNDogJ21vdXNlJ1xuXG5cdCAgICAvLyBjaGVjayBzdXBwb3J0IGZvciBwYXNzaXZlIGV2ZW50IGxpc3RlbmVyc1xuXHQgIH07dmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG5cdCAgdHJ5IHtcblx0ICAgIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcblx0ICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdCAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcblx0ICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0cyk7XG5cdCAgfSBjYXRjaCAoZSkge31cblx0ICAvLyBmYWlsIHNpbGVudGx5XG5cblxuXHQgIC8qXHJcblx0ICAgKiBzZXQgdXBcclxuXHQgICAqL1xuXG5cdCAgdmFyIHNldFVwID0gZnVuY3Rpb24gc2V0VXAoKSB7XG5cdCAgICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcblx0ICAgIGlucHV0TWFwW2RldGVjdFdoZWVsKCldID0gJ21vdXNlJztcblxuXHQgICAgYWRkTGlzdGVuZXJzKCk7XG5cdCAgfTtcblxuXHQgIC8qXHJcblx0ICAgKiBldmVudHNcclxuXHQgICAqL1xuXG5cdCAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVycygpIHtcblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXHQgICAgdmFyIG9wdGlvbnMgPSBzdXBwb3J0c1Bhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG5cdCAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgc2V0UGVyc2lzdCk7XG5cblx0ICAgIC8vIHBvaW50ZXIgZXZlbnRzIChtb3VzZSwgcGVuLCB0b3VjaClcblx0ICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHNldElucHV0KTtcblx0ICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgc2V0SW5wdXQpO1xuXHQgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBtb3VzZSBldmVudHNcblx0ICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHNldElucHV0KTtcblx0ICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHNldElucHV0LCBvcHRpb25zKTtcblx0ICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzZXRJbnB1dCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGRldGVjdFdoZWVsKCksIHNldEludGVudCwgb3B0aW9ucyk7XG5cblx0ICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzZXRJbnB1dCk7XG5cdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzZXRJbnB1dCk7XG5cblx0ICAgIC8vIGZvY3VzIGV2ZW50c1xuXHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBzZXRFbGVtZW50KTtcblx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIGNsZWFyRWxlbWVudCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBpZiBpbnB1dCBwZXJzaXN0ZW5jZSBzaG91bGQgaGFwcGVuIGFuZFxuXHQgIC8vIGdldCBzYXZlZCBzdGF0ZSBmcm9tIHNlc3Npb24gc3RvcmFnZSBpZiB0cnVlIChkZWZhdWx0cyB0byBgZmFsc2VgKVxuXHQgIHZhciBzZXRQZXJzaXN0ID0gZnVuY3Rpb24gc2V0UGVyc2lzdCgpIHtcblx0ICAgIHNob3VsZFBlcnNpc3QgPSAhKGRvY0VsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXdoYXRwZXJzaXN0JykgfHwgZG9jdW1lbnQuYm9keS5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdHBlcnNpc3QnKSA9PT0gJ2ZhbHNlJyk7XG5cblx0ICAgIGlmIChzaG91bGRQZXJzaXN0KSB7XG5cdCAgICAgIC8vIGNoZWNrIGZvciBzZXNzaW9uIHZhcmlhYmxlcyBhbmQgdXNlIGlmIGF2YWlsYWJsZVxuXHQgICAgICB0cnkge1xuXHQgICAgICAgIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnd2hhdC1pbnB1dCcpKSB7XG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnd2hhdC1pbnB1dCcpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnd2hhdC1pbnRlbnQnKSkge1xuXHQgICAgICAgICAgY3VycmVudEludGVudCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd3aGF0LWludGVudCcpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgIC8vIGZhaWwgc2lsZW50bHlcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgLy8gYWx3YXlzIHJ1biB0aGVzZSBzbyBhdCBsZWFzdCBgaW5pdGlhbGAgc3RhdGUgaXMgc2V0XG5cdCAgICBkb1VwZGF0ZSgnaW5wdXQnKTtcblx0ICAgIGRvVXBkYXRlKCdpbnRlbnQnKTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGNvbmRpdGlvbnMgYmVmb3JlIHVwZGF0aW5nIG5ldyBpbnB1dFxuXHQgIHZhciBzZXRJbnB1dCA9IGZ1bmN0aW9uIHNldElucHV0KGV2ZW50KSB7XG5cdCAgICB2YXIgZXZlbnRLZXkgPSBldmVudC53aGljaDtcblx0ICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXG5cdCAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykge1xuXHQgICAgICB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblx0ICAgIH1cblxuXHQgICAgdmFyIGlnbm9yZU1hdGNoID0gIXNwZWNpZmljTWFwLmxlbmd0aCAmJiBpZ25vcmVNYXAuaW5kZXhPZihldmVudEtleSkgPT09IC0xO1xuXG5cdCAgICB2YXIgc3BlY2lmaWNNYXRjaCA9IHNwZWNpZmljTWFwLmxlbmd0aCAmJiBzcGVjaWZpY01hcC5pbmRleE9mKGV2ZW50S2V5KSAhPT0gLTE7XG5cblx0ICAgIHZhciBzaG91bGRVcGRhdGUgPSB2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJiBldmVudEtleSAmJiAoaWdub3JlTWF0Y2ggfHwgc3BlY2lmaWNNYXRjaCkgfHwgdmFsdWUgPT09ICdtb3VzZScgfHwgdmFsdWUgPT09ICd0b3VjaCc7XG5cblx0ICAgIC8vIHByZXZlbnQgdG91Y2ggZGV0ZWN0aW9uIGZyb20gYmVpbmcgb3ZlcnJpZGRlbiBieSBldmVudCBleGVjdXRpb24gb3JkZXJcblx0ICAgIGlmICh2YWxpZGF0ZVRvdWNoKHZhbHVlKSkge1xuXHQgICAgICBzaG91bGRVcGRhdGUgPSBmYWxzZTtcblx0ICAgIH1cblx0ICAgIGRvVXBkYXRlKCdpbnB1dCcsIGV2ZW50LnRhcmdldCk7XG5cblx0ICAgIGlmIChzaG91bGRVcGRhdGUgJiYgY3VycmVudElucHV0ICE9PSB2YWx1ZSkge1xuXHQgICAgICBjdXJyZW50SW5wdXQgPSB2YWx1ZTtcblxuXHQgICAgICBwZXJzaXN0SW5wdXQoJ2lucHV0JywgZXZlbnQudGFyZ2V0KTtcblx0ICAgICAgZG9VcGRhdGUoJ2lucHV0JywgZXZlbnQudGFyZ2V0KTtcblx0ICAgIH1cblxuXHQgICAgaWYgKHNob3VsZFVwZGF0ZSAmJiBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAvLyBwcmVzZXJ2ZSBpbnRlbnQgZm9yIGtleWJvYXJkIGludGVyYWN0aW9uIHdpdGggZm9ybSBmaWVsZHNcblx0ICAgICAgdmFyIGFjdGl2ZUVsZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHQgICAgICB2YXIgbm90Rm9ybUlucHV0ID0gYWN0aXZlRWxlbSAmJiBhY3RpdmVFbGVtLm5vZGVOYW1lICYmIChmb3JtSW5wdXRzLmluZGV4T2YoYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEgfHwgYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnYnV0dG9uJyAmJiAhY2hlY2tDbG9zZXN0KGFjdGl2ZUVsZW0sICdmb3JtJykpO1xuXG5cdCAgICAgIGlmIChub3RGb3JtSW5wdXQpIHtcblx0ICAgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICBwZXJzaXN0SW5wdXQoJ2ludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICAgIGRvVXBkYXRlKCdpbnRlbnQnLCBldmVudC50YXJnZXQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIGRvVXBkYXRlID0gZnVuY3Rpb24gZG9VcGRhdGUod2hpY2gsIHRhcmdldCkge1xuXHQgICAgY29uc29sZS5sb2cod2hpY2gsIHRhcmdldCk7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0JyArIHdoaWNoLCB3aGljaCA9PT0gJ2lucHV0JyA/IGN1cnJlbnRJbnB1dCA6IGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgIGNvbnNvbGUubG9nKCdTRVQnLCBjdXJyZW50SW5wdXQsIGN1cnJlbnRJbnRlbnQsIHdoaWNoKTtcblx0ICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0JyArIHdoaWNoLCB3aGljaCA9PT0gJ2lucHV0JyA/IGN1cnJlbnRJbnB1dCA6IGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgfVxuXG5cdCAgICBmaXJlRnVuY3Rpb25zKHdoaWNoKTtcblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyBpbnB1dCBpbnRlbnQgZm9yIGBtb3VzZW1vdmVgIGFuZCBgcG9pbnRlcm1vdmVgXG5cdCAgdmFyIHNldEludGVudCA9IGZ1bmN0aW9uIHNldEludGVudChldmVudCkge1xuXHQgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cblx0ICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB7XG5cdCAgICAgIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXHQgICAgfVxuXG5cdCAgICAvLyB0ZXN0IHRvIHNlZSBpZiBgbW91c2Vtb3ZlYCBoYXBwZW5lZCByZWxhdGl2ZSB0byB0aGUgc2NyZWVuIHRvIGRldGVjdCBzY3JvbGxpbmcgdmVyc3VzIG1vdXNlbW92ZVxuXHQgICAgZGV0ZWN0U2Nyb2xsaW5nKGV2ZW50KTtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHNjcm9sbGluZyBpc24ndCBoYXBwZW5pbmdcblx0ICAgIGlmICgoIWlzU2Nyb2xsaW5nICYmICF2YWxpZGF0ZVRvdWNoKHZhbHVlKSB8fCBpc1Njcm9sbGluZyAmJiBldmVudC50eXBlID09PSAnd2hlZWwnIHx8IGV2ZW50LnR5cGUgPT09ICdtb3VzZXdoZWVsJyB8fCBldmVudC50eXBlID09PSAnRE9NTW91c2VTY3JvbGwnKSAmJiBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cdCAgICAgIHBlcnNpc3RJbnB1dCgnaW50ZW50JywgY3VycmVudEludGVudCk7XG5cdCAgICAgIGRvVXBkYXRlKCdpbnRlbnQnKTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgdmFyIHNldEVsZW1lbnQgPSBmdW5jdGlvbiBzZXRFbGVtZW50KGV2ZW50KSB7XG5cdCAgICBpZiAoIWV2ZW50LnRhcmdldC5ub2RlTmFtZSkge1xuXHQgICAgICAvLyBJZiBub2RlTmFtZSBpcyB1bmRlZmluZWQsIGNsZWFyIHRoZSBlbGVtZW50XG5cdCAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBpZiBjbGljayBpbnNpZGUgYW4gPHN2Zz4gZWxlbWVudC5cblx0ICAgICAgY2xlYXJFbGVtZW50KCk7XG5cdCAgICAgIHJldHVybjtcblx0ICAgIH1cblxuXHQgICAgY3VycmVudEVsZW1lbnQgPSBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRlbGVtZW50JywgY3VycmVudEVsZW1lbnQpO1xuXG5cdCAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdCAmJiBldmVudC50YXJnZXQuY2xhc3NMaXN0Lmxlbmd0aCkge1xuXHQgICAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0Y2xhc3NlcycsIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudG9TdHJpbmcoKS5yZXBsYWNlKCcgJywgJywnKSk7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIHZhciBjbGVhckVsZW1lbnQgPSBmdW5jdGlvbiBjbGVhckVsZW1lbnQoKSB7XG5cdCAgICBjdXJyZW50RWxlbWVudCA9IG51bGw7XG5cblx0ICAgIGRvY0VsZW0ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXdoYXRlbGVtZW50Jyk7XG5cdCAgICBkb2NFbGVtLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS13aGF0Y2xhc3NlcycpO1xuXHQgIH07XG5cblx0ICB2YXIgcGVyc2lzdElucHV0ID0gZnVuY3Rpb24gcGVyc2lzdElucHV0KHdoaWNoLCB2YWx1ZSkge1xuXHQgICAgaWYgKHNob3VsZFBlcnNpc3QpIHtcblx0ICAgICAgdHJ5IHtcblx0ICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnd2hhdC0nICsgd2hpY2gsIHZhbHVlKTtcblx0ICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgIC8vIGZhaWwgc2lsZW50bHlcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvKlxyXG5cdCAgICogdXRpbGl0aWVzXHJcblx0ICAgKi9cblxuXHQgIHZhciBwb2ludGVyVHlwZSA9IGZ1bmN0aW9uIHBvaW50ZXJUeXBlKGV2ZW50KSB7XG5cdCAgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgICByZXR1cm4gZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nID8gJ3RvdWNoJyA6IGV2ZW50LnBvaW50ZXJUeXBlO1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBwcmV2ZW50IHRvdWNoIGRldGVjdGlvbiBmcm9tIGJlaW5nIG92ZXJyaWRkZW4gYnkgZXZlbnQgZXhlY3V0aW9uIG9yZGVyXG5cdCAgdmFyIHZhbGlkYXRlVG91Y2ggPSBmdW5jdGlvbiB2YWxpZGF0ZVRvdWNoKHZhbHVlKSB7XG5cdCAgICB2YXIgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblxuXHQgICAgdmFyIHRvdWNoSXNWYWxpZCA9IHZhbHVlID09PSAnbW91c2UnICYmIGN1cnJlbnRJbnB1dCA9PT0gJ3RvdWNoJyAmJiB0aW1lc3RhbXAgLSBjdXJyZW50VGltZXN0YW1wIDwgMjAwO1xuXG5cdCAgICBjdXJyZW50VGltZXN0YW1wID0gdGltZXN0YW1wO1xuXG5cdCAgICByZXR1cm4gdG91Y2hJc1ZhbGlkO1xuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvd2hlZWxfZXZlbnRcblx0ICB2YXIgZGV0ZWN0V2hlZWwgPSBmdW5jdGlvbiBkZXRlY3RXaGVlbCgpIHtcblx0ICAgIHZhciB3aGVlbFR5cGUgPSBudWxsO1xuXG5cdCAgICAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblx0ICAgIGlmICgnb253aGVlbCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpIHtcblx0ICAgICAgd2hlZWxUeXBlID0gJ3doZWVsJztcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIFdlYmtpdCBhbmQgSUUgc3VwcG9ydCBhdCBsZWFzdCBcIm1vdXNld2hlZWxcIlxuXHQgICAgICAvLyBvciBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICAgICAgd2hlZWxUeXBlID0gZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgPyAnbW91c2V3aGVlbCcgOiAnRE9NTW91c2VTY3JvbGwnO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gd2hlZWxUeXBlO1xuXHQgIH07XG5cblx0ICAvLyBydW5zIGNhbGxiYWNrIGZ1bmN0aW9uc1xuXHQgIHZhciBmaXJlRnVuY3Rpb25zID0gZnVuY3Rpb24gZmlyZUZ1bmN0aW9ucyh0eXBlKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZnVuY3Rpb25MaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdCAgICAgIGlmIChmdW5jdGlvbkxpc3RbaV0udHlwZSA9PT0gdHlwZSkge1xuXHQgICAgICAgIGZ1bmN0aW9uTGlzdFtpXS5mbi5jYWxsKHVuZGVmaW5lZCwgdHlwZSA9PT0gJ2lucHV0JyA/IGN1cnJlbnRJbnB1dCA6IGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGZpbmRzIG1hdGNoaW5nIGVsZW1lbnQgaW4gYW4gb2JqZWN0XG5cdCAgdmFyIG9ialBvcyA9IGZ1bmN0aW9uIG9ialBvcyhtYXRjaCkge1xuXHQgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZ1bmN0aW9uTGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICBpZiAoZnVuY3Rpb25MaXN0W2ldLmZuID09PSBtYXRjaCkge1xuXHQgICAgICAgIHJldHVybiBpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIHZhciBkZXRlY3RTY3JvbGxpbmcgPSBmdW5jdGlvbiBkZXRlY3RTY3JvbGxpbmcoZXZlbnQpIHtcblx0ICAgIGlmIChtb3VzZVBvcy54ICE9PSBldmVudC5zY3JlZW5YIHx8IG1vdXNlUG9zLnkgIT09IGV2ZW50LnNjcmVlblkpIHtcblx0ICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuXHQgICAgICBtb3VzZVBvcy54ID0gZXZlbnQuc2NyZWVuWDtcblx0ICAgICAgbW91c2VQb3MueSA9IGV2ZW50LnNjcmVlblk7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBpc1Njcm9sbGluZyA9IHRydWU7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIG1hbnVhbCB2ZXJzaW9uIG9mIGBjbG9zZXN0KClgXG5cdCAgdmFyIGNoZWNrQ2xvc2VzdCA9IGZ1bmN0aW9uIGNoZWNrQ2xvc2VzdChlbGVtLCB0YWcpIHtcblx0ICAgIHZhciBFbGVtZW50UHJvdG90eXBlID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlO1xuXG5cdCAgICBpZiAoIUVsZW1lbnRQcm90b3R5cGUubWF0Y2hlcykge1xuXHQgICAgICBFbGVtZW50UHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50UHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnRQcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuXHQgICAgfVxuXG5cdCAgICBpZiAoIUVsZW1lbnRQcm90b3R5cGUuY2xvc2VzdCkge1xuXHQgICAgICBkbyB7XG5cdCAgICAgICAgaWYgKGVsZW0ubWF0Y2hlcyh0YWcpKSB7XG5cdCAgICAgICAgICByZXR1cm4gZWxlbTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBlbGVtID0gZWxlbS5wYXJlbnRFbGVtZW50IHx8IGVsZW0ucGFyZW50Tm9kZTtcblx0ICAgICAgfSB3aGlsZSAoZWxlbSAhPT0gbnVsbCAmJiBlbGVtLm5vZGVUeXBlID09PSAxKTtcblxuXHQgICAgICByZXR1cm4gbnVsbDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIHJldHVybiBlbGVtLmNsb3Nlc3QodGFnKTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLypcclxuXHQgICAqIGluaXRcclxuXHQgICAqL1xuXG5cdCAgLy8gZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmRcblx0ICAvLyAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgIGlmICgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXHQgIC8qXHJcblx0ICAgKiBhcGlcclxuXHQgICAqL1xuXG5cdCAgcmV0dXJuIHtcblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG5cdCAgICAvLyBvcHQ6ICdpbnRlbnQnfCdpbnB1dCdcblx0ICAgIC8vICdpbnB1dCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2ludGVudCc6IGluY2x1ZGVzIGBkYXRhLXdoYXRpbnRlbnRgIHZhbHVlIGlmIGl0J3MgZGlmZmVyZW50IHRoYW4gYGRhdGEtd2hhdGlucHV0YFxuXHQgICAgYXNrOiBmdW5jdGlvbiBhc2sob3B0KSB7XG5cdCAgICAgIHJldHVybiBvcHQgPT09ICdpbnRlbnQnID8gY3VycmVudEludGVudCA6IGN1cnJlbnRJbnB1dDtcblx0ICAgIH0sXG5cblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudCBvciBudWxsXG5cdCAgICBlbGVtZW50OiBmdW5jdGlvbiBlbGVtZW50KCkge1xuXHQgICAgICByZXR1cm4gY3VycmVudEVsZW1lbnQ7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBvdmVyd3JpdGVzIGlnbm9yZWQga2V5cyB3aXRoIHByb3ZpZGVkIGFycmF5XG5cdCAgICBpZ25vcmVLZXlzOiBmdW5jdGlvbiBpZ25vcmVLZXlzKGFycikge1xuXHQgICAgICBpZ25vcmVNYXAgPSBhcnI7XG5cdCAgICB9LFxuXG5cdCAgICAvLyBvdmVyd3JpdGVzIHNwZWNpZmljIGNoYXIga2V5cyB0byB1cGRhdGUgb25cblx0ICAgIHNwZWNpZmljS2V5czogZnVuY3Rpb24gc3BlY2lmaWNLZXlzKGFycikge1xuXHQgICAgICBzcGVjaWZpY01hcCA9IGFycjtcblx0ICAgIH0sXG5cblx0ICAgIC8vIGF0dGFjaCBmdW5jdGlvbnMgdG8gaW5wdXQgYW5kIGludGVudCBcImV2ZW50c1wiXG5cdCAgICAvLyBmdW5jdDogZnVuY3Rpb24gdG8gZmlyZSBvbiBjaGFuZ2Vcblx0ICAgIC8vIGV2ZW50VHlwZTogJ2lucHV0J3wnaW50ZW50J1xuXHQgICAgcmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gcmVnaXN0ZXJPbkNoYW5nZShmbiwgZXZlbnRUeXBlKSB7XG5cdCAgICAgIGZ1bmN0aW9uTGlzdC5wdXNoKHtcblx0ICAgICAgICBmbjogZm4sXG5cdCAgICAgICAgdHlwZTogZXZlbnRUeXBlIHx8ICdpbnB1dCdcblx0ICAgICAgfSk7XG5cdCAgICB9LFxuXG5cdCAgICB1blJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHVuUmVnaXN0ZXJPbkNoYW5nZShmbikge1xuXHQgICAgICB2YXIgcG9zaXRpb24gPSBvYmpQb3MoZm4pO1xuXG5cdCAgICAgIGlmIChwb3NpdGlvbiB8fCBwb3NpdGlvbiA9PT0gMCkge1xuXHQgICAgICAgIGZ1bmN0aW9uTGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuXHQgICAgICB9XG5cdCAgICB9LFxuXG5cdCAgICBjbGVhclN0b3JhZ2U6IGZ1bmN0aW9uIGNsZWFyU3RvcmFnZSgpIHtcblx0ICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLmNsZWFyKCk7XG5cdCAgICB9XG5cdCAgfTtcblx0fSgpO1xuXG4vKioqLyB9KVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsImltcG9ydCB3aGF0SW5wdXQgZnJvbSBcIndoYXQtaW5wdXRcIjtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuICBpZiAod2hhdElucHV0LmFzaygpID09PSBcIm1vdXNlXCIpIHtcclxuICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09PSBcIkJVVFRPTlwiKSBlLnRhcmdldC5ibHVyKCk7XHJcbiAgfVxyXG59KTtcclxuIl19
