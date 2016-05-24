'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectMapping = connectMapping;

var _props = require('./props');

var _actions = require('./actions');

var _reactRedux = require('react-redux');

function connectMapping(mapping) {
  var actionSelector = (0, _actions.selectActionsFromLogic)(mapping.actions);
  var propSelector = (0, _props.selectPropsFromLogic)(mapping.props);
  return (0, _reactRedux.connect)(propSelector, actionSelector, _actions.actionMerge);
}