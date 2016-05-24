'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathSelector = pathSelector;
exports.createSelectors = createSelectors;

var _reselect = require('reselect');

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
  var keys = Object.keys(typeof reducer === 'function' ? reducer() : reducer);

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