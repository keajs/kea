'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createLogic = createLogic;
exports.pathSelector = pathSelector;
exports.createSelectors = createSelectors;
exports.createCombinedReducer = createCombinedReducer;
exports.selectPropsFromLogic = selectPropsFromLogic;

var _effects = require('redux-saga/effects');

var _reselect = require('reselect');

var _redux = require('redux');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeaLogic = function () {
  function KeaLogic(args) {
    var _this = this;

    _classCallCheck(this, KeaLogic);

    Object.keys(args).forEach(function (key) {
      _this[key] = args[key];
    });
  }

  _createClass(KeaLogic, [{
    key: 'get',
    value: regeneratorRuntime.mark(function get(key) {
      return regeneratorRuntime.wrap(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _effects.select)(this.selectors[key]);

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

  return KeaLogic;
}();

function createLogic(args) {
  return new KeaLogic(args);
}

function pathSelector(path, state) {
  return [state].concat(path).reduce(function (v, a) {
    return v[a];
  });
}

function createSelectors(path, reducer) {
  var additional = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var selector = function selector(state) {
    return pathSelector(path, state);
  };
  var keys = Object.keys(reducer());

  var selectors = {
    root: selector
  };

  keys.forEach(function (key) {
    selectors[key] = (0, _reselect.createSelector)(selector, function (state) {
      return state[key];
    });
  });

  return Object.assign(selectors, additional);
}

function createCombinedReducer() {
  var logics = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  var reducer = {};

  logics.forEach(function (logic) {
    if (!logic.path) {
      console.error('[KEA-LOGIC] No path found for reducer!', logic);
      console.trace();
      return;
    }
    if (!logic.reducer) {
      console.error('[KEA-LOGIC] No reducer in logic!', logic.path, logic);
      console.trace();
      return;
    }
    reducer[logic.path[logic.path.length - 1]] = logic.reducer;
  });

  return (0, _redux.combineReducers)(reducer);
}

function selectPropsFromLogic() {
  var mapping = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var hash = {};

  Object.keys(mapping).forEach(function (key) {
    var selector = mapping[key].selectors ? mapping[key].selectors : mapping[key];

    if (typeof selector[key] !== 'undefined') {
      hash[key] = selector[key];
    } else {
      console.error('[KEA-LOGIC] selector ' + key + ' missing');
      console.trace();
    }
  });

  return (0, _reselect.createStructuredSelector)(hash);
}