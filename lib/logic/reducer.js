'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.createReducer = createReducer;
exports.createPersistentReducer = createPersistentReducer;
exports.createStructureReducer = createStructureReducer;

var _redux = require('redux');

function storageAvailable(type) {
  try {
    var storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

var storageCache = {};

function createReducer(mapping, defaultValue) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultValue;
    var action = arguments[1];

    if (mapping[action.type]) {
      return mapping[action.type](state, action.payload);
    } else {
      return state;
    }
  };
}

function createPersistentReducer(actions, defaultValue, key) {
  if (storageAvailable('localStorage')) {
    var _ret = function () {
      var storage = window.localStorage;

      var value = storage[key] ? JSON.parse(storage[key]) : defaultValue;
      storageCache[key] = value;

      var reducer = createReducer(actions, value);

      return {
        v: function v(state, payload) {
          var result = reducer(state, payload);
          if (storageCache[key] !== result) {
            storageCache[key] = result;
            storage[key] = JSON.stringify(result);
          }
          return result;
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    return createReducer(actions, defaultValue);
  }
}

function createStructureReducer(path, structure) {
  var reducers = {};

  Object.keys(structure).forEach(function (key) {
    var mapping = structure[key];
    if (typeof mapping.reducer === 'function') {
      reducers[key] = mapping.reducer;
    } else {
      reducers[key] = mapping.persist ? createPersistentReducer(mapping.reducer, mapping.value, path.join('.') + key) : createReducer(mapping.reducer, mapping.value);
    }
  });

  return (0, _redux.combineReducers)(reducers);
}