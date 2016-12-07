"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMapping = createMapping;
var gaveWarning = false;

// DEPRECATED
function createMapping(reducer, value, type, options) {
  if (!gaveWarning) {
    console.warn("[KEA-LOGIC] createMapping is deprecated. Please use the new compact Array format. See here for an example: https://gist.github.com/mariusandra/1b8eeb3f2f4e542188b915e27133c858");
    gaveWarning = true;
  }

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