'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.createReducer = createReducer;
exports.createPersistentReducer = createPersistentReducer;
exports.combineReducerObjects = combineReducerObjects;
exports.convertReducerArrays = convertReducerArrays;

var _redux = require('redux');

// storageAvailable('localStorage') == true or false
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

// create reducer function from such an object { [action]: (state, payload) => state }
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

// create reducer function from such an object { [action]: (state, payload) => state }
// with the added benefit that it's stored in localStorage
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

// input: object with values: { value, type, reducer, ...options } or function(state, action) {}
// output: combined reducer function (state, action) {}
function combineReducerObjects(path, objects) {
  var reducers = {};

  Object.keys(objects).forEach(function (key) {
    var object = objects[key];
    if (typeof object.reducer === 'function') {
      reducers[key] = object.reducer;
    } else {
      reducers[key] = object.persist ? createPersistentReducer(object.reducer, object.value, path.join('.') + key) : createReducer(object.reducer, object.value);
    }
  });

  return (0, _redux.combineReducers)(reducers);
}

// input: object with values: [value, type, options, reducer]
// output: object with values: { value, type, reducer, ...options }
function convertReducerArrays(reducers) {
  if (!reducers) {
    return reducers;
  }

  var keys = Object.keys(reducers);
  for (var i = 0; i < keys.length; i++) {
    var s = reducers[keys[i]];
    if (Array.isArray(s)) {
      // s = [ value, type, options, reducer ]
      reducers[keys[i]] = Object.assign({
        value: s[0],
        type: s[1], // proptype
        reducer: s[3] || s[2]
      }, s[3] ? s[2] : {});
    }
  }

  return reducers;
}