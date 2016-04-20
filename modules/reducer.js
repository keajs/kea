'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCombinedReducer = createCombinedReducer;

var _redux = require('redux');

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