'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathSelector = pathSelector;
exports.createSelectors = createSelectors;

var _reselect = require('reselect');

// input: ['scenes', 'something', 'other'], state
// output: state.scenes.something.other
function pathSelector(path, state) {
  return [state].concat(path).reduce(function (v, a) {
    return v[a];
  });
}

// input: ['states', 'something', 'other'], ['key1', 'key2', 'key3'], { bla: 'asdf' }
// output: {
//   root: (state) => states.something.other,
//   key1: (state) => states.something.other.key1,
//   key2: (state) => states.something.other.key2,
//   key3: (state) => states.something.other.key3,
//   bla: 'asdf'
// }
function createSelectors(path, keys) {
  var additional = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var rootSelector = function rootSelector(state) {
    return pathSelector(path, state);
  };

  var selectors = {
    root: rootSelector
  };

  keys.forEach(function (key) {
    selectors[key] = (0, _reselect.createSelector)(rootSelector, function (state) {
      return state[key];
    });
  });

  return Object.assign(selectors, additional);
}