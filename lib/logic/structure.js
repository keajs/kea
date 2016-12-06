"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMapping = createMapping;
exports.convertStructureArrays = convertStructureArrays;
var gaveWarning = false;

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

function convertStructureArrays(structure) {
  if (!structure) {
    return structure;
  }

  var keys = Object.keys(structure);
  for (var i = 0; i < keys.length; i++) {
    var s = structure[keys[i]];
    if (Array.isArray(s)) {
      // s = [ value, type, options, reducer ]
      structure[keys[i]] = Object.assign({
        value: s[0],
        type: s[1],
        reducer: s[3] || s[2]
      }, s[3] ? s[2] : {});
    }
  }

  return structure;
}