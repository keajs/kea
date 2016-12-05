"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMapping = createMapping;
function createMapping(reducer, value, type, options) {
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