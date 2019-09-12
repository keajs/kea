webpackJsonp([13],{501:function(e,t,n){"use strict";function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),n.d(t,"default",function(){return p});var r=n(10),i=n.n(r),c=n(200),l=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),u={keaUsage:n(625)},p=function(e){function t(){return o(this,t),a(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return s(t,e),l(t,[{key:"render",value:function(){return i.a.createElement("div",{className:"api-scene"},i.a.createElement("h2",null,i.a.createElement("code",null,"kea(input)")),i.a.createElement("p",null,"Create a new kea ",i.a.createElement("code",null,"logic"),"."),i.a.createElement("h3",null,"Usage"),i.a.createElement("p",null,"Here is a complete example with all the options available."),i.a.createElement(c.default,{className:"javascript"},u.keaUsage))}}]),t}(r.Component)},625:function(e,t){e.exports="import { kea } from 'kea'\nimport PropTypes from 'prop-types'\n\nimport logicToMount from './logicToMount'\nimport otherLogic from './other-logic'\nimport logicWithKey from './logic-with-key'\n\nconst actionCreatorsObject = {\n  someAction: (id) => ({ type: 'bla', payload: { id } })\n}\n\nconst logic = kea({\n  // Connect to other logic or plain Redux and import its actions and values\n  // to be used inside this logic.\n  // connect can be a regular object (connect: {}) or a function that takes props\n  // as an input (connect: props => ({}))\n  connect: ({ id }) => ({\n    actions: [\n      otherLogic, [\n        // otherLogic.actions.firstAction --\x3e logic.actions.firstAction\n        'firstAction',\n        // otherLogic.actions.secondAction --\x3e logic.actions.renamedAction\n        'secondAction as renamedAction'\n      ],\n      actionCreatorsObject, [\n        // take someAction from a regular object and wrap it with dispatch()\n        'someAction'\n      ]\n    ],\n\n    values: [\n      otherLogic, [\n        // otherLogic.values.firstProp --\x3e logic.values.firstProp\n        'firstProp',\n        // otherLogic.values.secondProp --\x3e logic.values.renamedProp\n        'secondProp as renamedProp',\n        // { ...otherLogic.values } --\x3e logic.values.allProps\n        '* as allProps'\n      ],\n\n      // if a logic uses a key to initialize independent instances, pass some\n      // props to the logic you're connecting to\n      logicWithKey({ id }), [\n        'dynamicProp as thatProp'\n      ],\n\n      // select from any redux tree node\n      state => state.something.that.resolves.to.an.object, [\n        'variable',\n        'otherVariable'\n      ]\n    ],\n\n    // in case you want to connect a logic and mount it when this one gets mounted,\n    // without importing any values (for example to start some listeners, etc),\n    // then connect it like so:\n    logic: [logicToMount]\n  }),\n\n  // you may *optionally* name your logic and specify where it ends up in redux:\n  path: () => ['scenes', 'myRandomScene', 'index'],\n\n  // if you wish to instantiate many independent copies of the same logic, use\n  // the key attribute and take the unique key from the props, then *optionally*\n  // pass it to the path\n  key: props => props.id,\n  path: key => ['scenes', 'myRandomScene', 'index', key],\n\n  // you can create constants that will be accessible later in the \"constants\"\n  // object in the format { STRING: 'STRING', OTHER_STRING: 'OTHER_STRING' }\n  constants: () => ['STRING', 'OTHER_STRING'],\n\n  // there are a few ways to define your actions\n  actions: () => ({\n    actionWithStaticPayload: 'payload value',\n    anotherActionWithAStaticPayload: { thisIs: 'that' },\n    simpleAction: true,\n\n    actionWithDynamicPayload: (id) => ({ id }),\n    actionWithManyParameters: (id, message) => ({ id, message }),\n    actionWithObjectInput: ({ id, message }) => ({ id, message })\n  }),\n\n  // Defaults are specified as the first parameter to the reducers.\n  // However you can have a separate \"defaults\" key that overrides that.\n  // Feel free to use selectors in any way you like in this object.\n  // Some examples follow:\n  defaults: {\n    reducerKey: 'yes please'\n  },\n\n  defaults: ({ selectors }) => ({\n    reducerKey: selectors.firstProp\n  }),\n\n  defaults: ({ selectors }) => state => ({\n    reducerKey: selectors.allProps(state).firstProp\n  }),\n\n  // Reducers store data in logic.\n  // You must specify the default value and any actions that change it.\n\n  // Optionally you can also give each reducer a PropType and it will be automatically\n  // injected into React class-based Components. This is not useful if you're using hooks.\n\n  // You can also give an options object as the last parameter before the actions.\n  // Some plugins (e.g. localStorage) use it to manipulate the reducers\n  reducers: ({ actions, constants, props, selectors }) => ({\n    reducerKey: ['defaultValue', /* PropTypes.string, */ /* { optoins }, */ {\n      // Each action gets 3 parameters: (state, payload, meta)\n      // - state = the current value in the reducer\n      // - payload = the action.payload\n      // - meta = optionally the action.meta value\n\n      // Reducers must NEVER modify the existing object\n      // DO __NOT__ DO THIS: (state, payload) => { state[payload.key] = payload.value }\n\n      // They must always return a new object:\n      // Do this: (state, payload) => ({ ...state, [payload.key]: payload.value })\n      [actions.simpleAction]: (state, payload) => state + payload.value, // return the new state,\n      [actions.complexAction]: (state, payload) => {\n        // do more things in the block\n        return state + payload.value\n      },\n      [actions.noStateUsed]: (_, payload) => payload.value,\n      [actions.setToTrue]: () => true,\n      [actions.clearSomething]: () => false,\n      'ANY_OTHER_ACTION_TYPE': (state, payload, meta) => 'do whatever you want'\n    }],\n\n    // The defaults for reducers can come from props (if you're using a key and passing props)\n    defaultFromProps: [props.id, PropTypes.number, {\n      [actions.clearSomething]: () => constants.STRING,\n      [actions.someOtherAction]: (_, payload) => payload.value\n    }],\n\n    // ... or from a selector that you have connected to\n    defaultFromSelectors: [selectors.otherValable, PropTypes.number, {\n      [actions.clearSomething]: () => constants.STRING,\n      [actions.someOtherAction]: (_, payload) => payload.value\n    }],\n\n    // ... or from a constant\n    constantDefault: [constants.OTHER_STRING, PropTypes.string, {\n      [actions.clearSomething]: () => constants.STRING,\n      [actions.someOtherAction]: (_, payload) => payload.value\n    }]\n  }),\n\n  // Selectors take the input of one or more selectors (created automatically for reducers)\n  // and return a combined output. Selectors are recalculated only if one of the inputs\n  // changes.\n  selectors: ({ selectors }) => ({\n    computedValue: [\n      () => [\n        selectors.reducerKey,\n        selectors.constantDefault,\n        state => state.variable.from.redux,\n        (_, props) => props.id // you can access props like this\n      ],\n      (reducerKey, constantDefault, variable, id) => {\n        return expensiveComputation(reducerKey, constantDefault, variable, id)\n      },\n      PropTypes.object\n    ]\n  }),\n\n  // Finally, you can hook into the moments when the logic is either\n  // mounted onto redux or unmounted from it:\n  events: ({ actions, values }) => ({\n    beforeMount () {\n      // values.reducerKey is a shorthand for selectors.reducerKey(state)\n      // It's actually a getter function that returns the value at this moment.\n      // Using \"values.reducerKey\" at a later state might return a different result.\n      if (values.reducerKey === 'defaultValue') {\n        actions.simpleAction()\n      }\n\n      // In case you want to capture a snapshot of the values as they currently are,\n      // never use the \"values\" object directly. Instead make a copy of its data:\n      // -> const params = { ...values }  // capture all of them\n      // -> const { reducerKey } = values // just capture one\n    },\n    afterMount () {},\n    beforeUnmount () {},\n    afterUnmount () {}\n  })\n})\n"}});