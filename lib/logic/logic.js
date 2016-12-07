'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _effects = require('redux-saga/effects');

var _reselect = require('reselect');

var _reducer = require('./reducer');

var _selectors = require('./selectors');

var _actions = require('./actions');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var gaveAddSelectorWarning = false;
var gaveStructureWarning = false;

var Logic = function () {
  function Logic() {
    _classCallCheck(this, Logic);

    this.path = function () {
      return [];
    };

    this.selector = function (state) {
      return state;
    };

    this.constants = function () {
      return {};
    };

    this.actions = function () {
      return {};
    };

    this.reducers = function () {
      return {};
    };

    this.reducer = function (_ref) {
      var path = _ref.path,
          reducers = _ref.reducers;
      return (0, _reducer.combineReducerObjects)(path, reducers);
    };

    this.selectors = function (_ref2) {
      var selectors = _ref2.selectors;
      return {};
    };
  }

  _createClass(Logic, [{
    key: 'init',
    value: function init() {
      var object = {};

      object.path = this.path();
      object.selector = function (state) {
        return (0, _selectors.pathSelector)(object.path, state);
      };
      object.constants = this.constants(object);
      object.actions = (0, _actions.createActions)(this.actions(object), object.path);

      // reducers
      if (this.structure) {
        // DEPRECATED
        if (!gaveStructureWarning) {
          console.warn('[KEA-LOGIC] structure = () => ({}) is deprecated. Please rename it to reducers = () => ({}).');
          gaveStructureWarning = true;
        }
        object.reducers = (0, _reducer.convertReducerArrays)(this.structure(object));
      } else {
        object.reducers = (0, _reducer.convertReducerArrays)(this.reducers(object));
      }
      object.reducer = this.reducer(object);

      object.selectors = (0, _selectors.createSelectors)(object.path, Object.keys(object.reducers));

      // selectors
      // TODO: remove addSelector deprecation
      var response = this.selectors(_extends({}, object, { addSelector: this._addSelector.bind(object) }));

      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
        var keys = Object.keys(response);
        for (var i = 0; i < keys.length; i++) {
          var s = response[keys[i]];

          // s[0]() == [type, args]
          var a = s[0]();

          object.reducers[keys[i]] = { type: a.shift() };
          object.selectors[keys[i]] = _reselect.createSelector.apply(undefined, _toConsumableArray(a).concat([s[1]]));
        }
      }

      Object.assign(this, object);

      return this;
    }

    // DEPRECATED

  }, {
    key: '_addSelector',
    value: function _addSelector(name, type, args, func) {
      if (!gaveAddSelectorWarning) {
        console.warn('[KEA-LOGIC] addSelector is deprecated. Please use the new compact Array format.');
        gaveAddSelectorWarning = true;
      }

      this.structure[name] = { type: type };
      this.selectors[name] = _reselect.createSelector.apply(undefined, _toConsumableArray(args).concat([func]));
    }
  }, {
    key: 'get',
    value: regeneratorRuntime.mark(function get(key) {
      return regeneratorRuntime.wrap(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _effects.select)(key ? this.selectors[key] : this.selector);

            case 2:
              return _context.abrupt('return', _context.sent);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, get, this);
    })
  }, {
    key: 'fetch',
    value: regeneratorRuntime.mark(function fetch() {
      var results,
          keys,
          i,
          _args2 = arguments;
      return regeneratorRuntime.wrap(function fetch$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              results = {};
              keys = Array.isArray(_args2[0]) ? _args2[0] : _args2;
              i = 0;

            case 3:
              if (!(i < keys.length)) {
                _context2.next = 10;
                break;
              }

              _context2.next = 6;
              return this.get(keys[i]);

            case 6:
              results[keys[i]] = _context2.sent;

            case 7:
              i++;
              _context2.next = 3;
              break;

            case 10:
              return _context2.abrupt('return', results);

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, fetch, this);
    })
  }]);

  return Logic;
}();

Logic._isKeaLogicClass = true;

exports.default = Logic;