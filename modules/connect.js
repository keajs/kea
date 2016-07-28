'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectMapping = connectMapping;

var _props = require('./props');

var _actions = require('./actions');

var _reactRedux = require('react-redux');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function connectMapping(mapping) {
  var actionTransforms = (0, _actions.createActionTransforms)(mapping.actions);
  var propTransforms = (0, _props.createPropTransforms)(mapping.props);

  var actionMerge = function actionMerge(stateProps, dispatchProps, ownProps) {
    var props = Object.assign({}, ownProps, stateProps);
    var actions = Object.assign({}, dispatchProps);

    Object.keys(propTransforms.transforms).forEach(function (key) {
      props[key] = propTransforms.transforms[key](stateProps[key], ownProps);
    });

    Object.keys(actionTransforms.transforms).forEach(function (key) {
      var newArgs = actionTransforms.transforms[key].map(function (k) {
        return ownProps[k];
      });
      actions[key] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return dispatchProps[key].apply(dispatchProps, _toConsumableArray(newArgs).concat(args));
      };
    });

    return Object.assign({}, props, { actions: actions });
  };

  return (0, _reactRedux.connect)(propTransforms.selectors, actionTransforms.actions, actionMerge);
}