'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createPropTransforms = createPropTransforms;
exports.selectPropsFromLogic = selectPropsFromLogic;
exports.propTypesFromMapping = propTypesFromMapping;
exports.havePropsChanged = havePropsChanged;

var _react = require('react');

var _reselect = require('reselect');

function createPropTransforms() {
  var mapping = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectPropsFromLogic:', mapping);
    console.trace();
    return;
  }

  var hash = {};
  var transforms = {};

  var _loop = function _loop(i) {
    var logic = mapping[i];
    var props = mapping[i + 1];

    // we were given a function (state) => state.something as logic input
    var isFunction = typeof logic === 'function';

    var selectors = isFunction ? null : logic.selectors ? logic.selectors : logic;

    props.forEach(function (query) {
      var from = query;
      var to = query;

      if (query.includes(' as ')) {
        var _query$split = query.split(' as ');

        var _query$split2 = _slicedToArray(_query$split, 2);

        from = _query$split2[0];
        to = _query$split2[1];
      }

      var matches = from.match(/^(.*)\[(.*)\]$/);

      if (matches) {
        from = matches[1];
        transforms[to] = function (value, props) {
          console.log(4, matches[2], props[matches[2]]);
          return value[props[matches[2]]];
        };
      }

      if (from === '*') {
        hash[to] = isFunction ? logic : logic.selector ? logic.selector : selectors;
      } else if (isFunction) {
        hash[to] = function (state) {
          return logic(state)[from];
        };
      } else if (typeof selectors[from] !== 'undefined') {
        hash[to] = selectors[from];
      } else {
        console.error('[KEA-LOGIC] selector "' + query + '" missing for logic:', logic);
        console.trace();
      }
    });
  };

  for (var i = 0; i < mapping.length; i += 2) {
    _loop(i);
  }

  return {
    selectors: (0, _reselect.createStructuredSelector)(hash),
    transforms: transforms
  };
}

function selectPropsFromLogic() {
  var mapping = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createPropTransforms(mapping).selectors;
}

function propTypesFromMapping(mapping) {
  var extra = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var propTypes = Object.assign({}, mapping.passedProps || {});

  if (mapping.props) {
    if (mapping.props.length % 2 === 1) {
      console.error('[KEA-LOGIC] uneven props mapping given to propTypesFromLogic:', mapping);
      console.trace();
      return;
    }

    var _loop2 = function _loop2(i) {
      var logic = mapping.props[i];
      var props = mapping.props[i + 1];

      props.forEach(function (query) {
        var from = query;
        var to = query;

        if (query.includes(' as ')) {
          var _query$split3 = query.split(' as ');

          var _query$split4 = _slicedToArray(_query$split3, 2);

          from = _query$split4[0];
          to = _query$split4[1];
        }

        var matches = from.match(/^(.*)\[(.*)\]$/);

        if (matches) {
          from = matches[1];
        }

        var structure = logic.structure[from];

        if (structure && structure.type) {
          propTypes[to] = structure.type;
        } else {
          console.error('[KEA-LOGIC] prop type "' + query + '" missing for logic:', logic);
          console.trace();
        }
      });
    };

    for (var i = 0; i < mapping.props.length; i += 2) {
      _loop2(i);
    }
  }

  if (mapping.actions) {
    if (mapping.actions.length % 2 === 1) {
      console.error('[KEA-LOGIC] uneven actions mapping given to propTypesFromLogic:', mapping);
      console.trace();
      return;
    }

    var actions = {};

    var _loop3 = function _loop3(_i) {
      var logic = mapping.actions[_i];
      var actionsArray = mapping.actions[_i + 1];

      var actions = logic && logic.actions ? logic.actions : logic;

      actionsArray.forEach(function (query) {
        var from = query;
        var to = query;

        if (query.includes(' as ')) {
          var _query$split5 = query.split(' as ');

          var _query$split6 = _slicedToArray(_query$split5, 2);

          from = _query$split6[0];
          to = _query$split6[1];
        }

        if (actions[from]) {
          propTypes[to] = _react.PropTypes.func;
        } else {
          console.error('[KEA-LOGIC] action "' + query + '" missing for logic:', logic);
          console.trace();
        }
      });
    };

    for (var _i = 0; _i < mapping.actions.length; _i += 2) {
      _loop3(_i);
    }

    propTypes.actions = _react.PropTypes.shape(actions);
  }

  if (extra) {
    Object.assign(propTypes, extra);
  }

  return propTypes;
}

function havePropsChangedDebug(nextProps) {
  var _this = this;

  var changedProps = Object.keys(nextProps).filter(function (key) {
    return key !== 'actions' && nextProps[key] !== _this.props[key];
  });
  if (changedProps.length > 0) {
    changedProps.forEach(function (key) {
      console.log('prop \'' + key + '\' changed', _this.props[key], nextProps[key]);
    });
    return true;
  }
  return false;
}

function havePropsChangedProduction(nextProps) {
  for (var key in nextProps) {
    if (key === 'actions') {
      continue;
    }
    if (nextProps[key] !== this.props[key]) {
      return true;
    }
  }
  return false;
}

function havePropsChanged() {
  var debug = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

  if (debug) {
    return havePropsChangedDebug;
  } else {
    return havePropsChangedProduction;
  }
}