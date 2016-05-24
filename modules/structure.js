"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStructure = createStructure;
function createStructure(reducer, value, type, options) {
  var mapping = {
    type: type,
    value: value,
    reducer: reducer
  };

  if (options) {
    Object.assign(mapping, options);
  }

  return mapping;
}