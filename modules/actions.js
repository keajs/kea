'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createActionTransforms = createActionTransforms;
exports.selectActionsFromLogic = selectActionsFromLogic;
function createActionTransforms() {
  var mapping = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectActionsFromLogic:', mapping);
    console.trace();
    return;
  }

  var hash = {};
  var transforms = {};

  var _loop = function _loop(i) {
    var logic = mapping[i];
    var actionsArray = mapping[i + 1];

    var actions = logic && logic.actions ? logic.actions : logic;

    actionsArray.forEach(function (query) {
      var from = query;
      var to = query;

      if (query.includes(' as ')) {
        var _query$split = query.split(' as ');

        var _query$split2 = _slicedToArray(_query$split, 2);

        from = _query$split2[0];
        to = _query$split2[1];
      }

      var matches = from.match(/^(.*)\((.*)\)$/);

      if (matches) {
        if (from === to) {
          to = matches[1];
        }
        from = matches[1];
        transforms[to] = matches[2].split(',').map(function (s) {
          return s.trim();
        });
      }

      if (typeof actions[from] === 'function') {
        hash[to] = actions[from];
      } else {
        console.error('[KEA-LOGIC] action "' + query + '" missing for logic:', logic);
        console.trace();
      }
    });
  };

  for (var i = 0; i < mapping.length; i += 2) {
    _loop(i);
  }

  return {
    actions: hash,
    transforms: transforms
  };
}

function selectActionsFromLogic() {
  var mapping = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createActionTransforms(mapping).actions;
}