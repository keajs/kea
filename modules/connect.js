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
  var propTransforms = (0, _props.createPropTransforms)(mapping.props);

  var actionMerge = function actionMerge(stateProps, dispatchProps, ownProps) {
    var newState = {};

    Object.keys(propTransforms.transforms).forEach(function (key) {
      newState[key] = propTransforms.transforms[key](stateProps[key], ownProps);
    });

    return Object.assign({}, ownProps, stateProps, newState, { actions: dispatchProps });
  };

  return (0, _reactRedux.connect)(propTransforms.selectors, actionSelector, actionMerge);
}