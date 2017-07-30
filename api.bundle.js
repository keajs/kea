webpackJsonp([0],{181:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t(16),o=(t.n(a),t(294));n.default=t.i(a.createScene)({name:"apiAction",component:o.a})},182:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t(16),o=(t.n(a),t(295));n.default=t.i(a.createScene)({name:"apiComponent",component:o.a})},183:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t(16),o=(t.n(a),t(296));n.default=t.i(a.createScene)({name:"apiConnect",component:o.a})},184:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t(16),o=(t.n(a),t(297));n.default=t.i(a.createScene)({name:"apiLogic",component:o.a})},185:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t(16),o=(t.n(a),t(298));n.default=t.i(a.createScene)({name:"apiReducer",component:o.a})},186:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a=t(16),o=(t.n(a),t(299));n.default=t.i(a.createScene)({name:"apiSaga",component:o.a})},294:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function r(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}var c=t(1),s=t.n(c),i=t(21),l=t.n(i);t.d(n,"a",function(){return m});var u=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),p={usage:t(746)},m=function(e){function n(){return a(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return r(n,e),u(n,[{key:"render",value:function(){return s.a.createElement("div",{className:"api-scene"},s.a.createElement("h2",null,s.a.createElement("code",null,"createAction")),s.a.createElement("p",null,"Create actions which you can use in your kea reducers."),s.a.createElement("h3",null,"Usage"),s.a.createElement(l.a,{className:"javascript"},p.usage))}}]),n}(c.Component)},295:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function r(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}var c=t(1),s=t.n(c),i=t(14),l=(t.n(i),t(42)),u=(t.n(l),t(21)),p=t.n(u);t.d(n,"a",function(){return h});var m,d,f=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),y={usage:t(750),decorators:t(747),path:t(749),key:t(748)},h=(m=t.i(i.kea)({}),m(d=function(e){function n(){var e,r,c,s;a(this,n);for(var i=arguments.length,u=Array(i),p=0;p<i;p++)u[p]=arguments[p];return r=c=o(this,(e=n.__proto__||Object.getPrototypeOf(n)).call.apply(e,[this].concat(u))),c.handleRoute=function(e){var n=c.props.dispatch,a=e.target.attributes.href.value;e.preventDefault(),n(t.i(l.push)(a)),window.scrollTo(0,0)},s=r,o(c,s)}return r(n,e),f(n,[{key:"render",value:function(){return s.a.createElement("div",{className:"api-scene"},s.a.createElement("h2",null,s.a.createElement("code",null,"kea(options)(Component)")),s.a.createElement("p",null,"Wrap a kea logic store around a React component."),s.a.createElement("p",null,"The component will receive all selectors in ",s.a.createElement("code",null,"this.props")," and all actions under ",s.a.createElement("code",null,"this.actions"),"."),s.a.createElement(p.a,{className:"javascript"},y.usage),s.a.createElement("p",null,"It's up to you if you wish to use decorators or not:"),s.a.createElement(p.a,{className:"javascript"},y.decorators),s.a.createElement("p",null,"See the ",s.a.createElement("a",{href:"/guide/installation",onClick:this.handleRoute},"installation guide")," for details."),s.a.createElement("h3",null,"Options"),s.a.createElement("p",null,"Wrapped logic stores accept all the same options as regular logic stores. See the documentation for ",s.a.createElement("code",null,s.a.createElement("a",{href:"/api/logic",onClick:this.handleRoute},"kea(options)"))," for more details."),s.a.createElement("p",null,"These options are different:"),s.a.createElement("h4",null,"key: ",s.a.createElement("code",null,"(props) => 'key'")),s.a.createElement("p",null,"If you wish, you may define a ",s.a.createElement("code",null,"key")," that distinguishes instances of the component"),s.a.createElement(p.a,{className:"javascript"},y.key),s.a.createElement("h4",null,"path: ",s.a.createElement("code",null,"(key) => []")),s.a.createElement("p",null,"The path takes the key as an argument if you wish to define the location in redux for the component instance"),s.a.createElement(p.a,{className:"javascript"},y.path))}}]),n}(c.Component))||d)},296:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function r(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}var c=t(1),s=t.n(c),i=t(21),l=t.n(i);t.d(n,"a",function(){return m});var u=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),p={usage:t(751)},m=function(e){function n(){return a(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return r(n,e),u(n,[{key:"render",value:function(){return s.a.createElement("div",{className:"api-scene"},s.a.createElement("h2",null,s.a.createElement("code",null,"connect(options)")),s.a.createElement("p",null,"Shorthand for ",s.a.createElement("code",null,"kea({ connect: options })")),s.a.createElement("h3",null,"Usage"),s.a.createElement(l.a,{className:"javascript"},p.usage))}}]),n}(c.Component)},297:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function r(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}var c=t(1),s=t.n(c),i=t(21),l=t.n(i);t.d(n,"a",function(){return m});var u=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),p={keaUsage:t(763),keaPath:t(755),keaConstants:t(754),keaActions:t(752),keaReducers:t(756),keaSelectors:t(758),keaConnect:t(753),keaSagas:t(757),keaStart:t(759),keaStop:t(760),keaTakeEvery:t(761),keaTakeLatest:t(762),keaWorkers:t(764)},m=function(e){function n(){return a(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return r(n,e),u(n,[{key:"render",value:function(){return s.a.createElement("div",{className:"api-scene"},s.a.createElement("h2",null,s.a.createElement("code",null,"kea(options)")),s.a.createElement("p",null,"Create a new kea ",s.a.createElement("strong",null,"logic store")," and connect it to redux."),s.a.createElement("h3",null,"Usage"),s.a.createElement("p",null,"Here is a complete example with all the options available. See below for further explanations."),s.a.createElement(l.a,{className:"javascript"},p.keaUsage),s.a.createElement("h3",null,"Options"),s.a.createElement("h4",null,"path: ",s.a.createElement("code",null,"() => []")),s.a.createElement("p",null,"Give a name to the logic store and register it in a certain location in your application's Redux tree."),s.a.createElement(l.a,{className:"javascript"},p.keaPath),s.a.createElement("h4",null,"constants: ",s.a.createElement("code",null,"() => []")),s.a.createElement("p",null,"Create constants that can be used in other parts of the logic store."),s.a.createElement(l.a,{className:"javascript"},p.keaConstants),s.a.createElement("h4",null,"actions: ",s.a.createElement("code",null,"({ path, constants }) => ({})")),s.a.createElement("p",null,"Define action creators"),s.a.createElement(l.a,{className:"javascript"},p.keaActions),s.a.createElement("h4",null,"reducers: ",s.a.createElement("code",null,"({ path, constants, actions }) => ({})")),s.a.createElement("p",null,"Define the structure and logic of your reducers"),s.a.createElement(l.a,{className:"javascript"},p.keaReducers),s.a.createElement("h4",null,"selectors: ",s.a.createElement("code",null,"({ path, constants, actions, selectors }) => ({})")),s.a.createElement("p",null,"Define selectors, which are only recomputed when their input changes"),s.a.createElement(l.a,{className:"javascript"},p.keaSelectors),s.a.createElement("h4",null,"connect: ",s.a.createElement("code",null,"{}")),s.a.createElement("p",null,"Fetch actions and selectors/props from other logic stores."),s.a.createElement(l.a,{className:"javascript"},p.keaConnect),s.a.createElement("h4",null,"start: ",s.a.createElement("code",null,"function * () ","{}")),s.a.createElement("p",null,"Saga that is started whenever the saga exported from this component starts"),s.a.createElement(l.a,{className:"javascript"},p.keaStart),s.a.createElement("h4",null,"stop: ",s.a.createElement("code",null,"function * () ","{}")),s.a.createElement("p",null,"Saga that is started whenever the saga exported from this component is cancelled"),s.a.createElement(l.a,{className:"javascript"},p.keaStop),s.a.createElement("h4",null,"takeEvery: ",s.a.createElement("code",null,"({ actions }) => ({})")),s.a.createElement("p",null,"Run the following workers every time the action is dispatched"),s.a.createElement(l.a,{className:"javascript"},p.keaTakeEvery),s.a.createElement("h4",null,"takeLatest: ",s.a.createElement("code",null,"({ actions }) => ({})")),s.a.createElement("p",null,"Run the following workers every time the action is dispatched, cancel the previous worker if still running"),s.a.createElement(l.a,{className:"javascript"},p.keaTakeLatest),s.a.createElement("h4",null,"workers: ",s.a.createElement("code",null,"{}")),s.a.createElement("p",null,"An object of workers which you may reference in other sagas."),s.a.createElement(l.a,{className:"javascript"},p.keaWorkers),s.a.createElement("h4",null,"sagas: ",s.a.createElement("code",null,"[]")),s.a.createElement("p",null,"Array of sagas that get exported with this component's saga"),s.a.createElement(l.a,{className:"javascript"},p.keaSagas))}}]),n}(c.Component)},298:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function r(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}var c=t(1),s=t.n(c),i=t(21),l=t.n(i);t.d(n,"a",function(){return m});var u=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),p={usage:t(765)},m=function(e){function n(){return a(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return r(n,e),u(n,[{key:"render",value:function(){return s.a.createElement("div",{className:"api-scene"},s.a.createElement("h2",null,s.a.createElement("code",null,"keaReducer(reducerRoot)")),s.a.createElement("p",null,"Define paths in Redux which kea can use."),s.a.createElement("h3",null,"Usage"),s.a.createElement(l.a,{className:"javascript"},p.usage),s.a.createElement("p",null,"After this you may use paths like ",s.a.createElement("code",null,"path: () => ['scenes', '...', 'bla']")," in your logic stores."),s.a.createElement("p",null,"All logic stores that are defined without paths will be mounted under the first registered reducer, in this case under ",s.a.createElement("code",null,"kea.*")))}}]),n}(c.Component)},299:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function r(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}var c=t(1),s=t.n(c),i=t(21),l=t.n(i);t.d(n,"a",function(){return m});var u=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),p={usage:t(766)},m=function(e){function n(){return a(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return r(n,e),u(n,[{key:"render",value:function(){return s.a.createElement("div",{className:"api-scene"},s.a.createElement("h2",null,s.a.createElement("code",null,"keaSaga")),s.a.createElement("p",null,"You must run this saga in order to use the saga functionality in kea (",s.a.createElement("code",null,"start"),", ",s.a.createElement("code",null,"stop"),", ",s.a.createElement("code",null,"takeEvery"),", ",s.a.createElement("code",null,"takeLatest"),", ...)"),s.a.createElement("h3",null,"Usage"),s.a.createElement(l.a,{className:"javascript"},p.usage))}}]),n}(c.Component)},746:function(e,n){e.exports="import { createAction } from 'kea'\n\nconst newAction = createAction('description', (id, value) => ({ id, value }))\n\nconst someLogic = kea({\n  actions: () => ({\n    myAction: true\n  }),\n\n  reducers: ({ actions }) => ({\n    myValue: [false, PropTypes.bool,\n      [actions.myAction]: () => true,\n      [newAction]: () => false\n    ]\n  })\n})\n\n// somewhere else\nstore.dispatch(newAction(12, 'bla'))\n"},747:function(e,n){e.exports="import React, { Component } from 'react'\nimport { kea } from 'kea'\n\n// with decorators\n@kea({ /* options */ })\nexport default class MyComponent extends Component {\n  // ...\n}\n\n// without decorators\nclass MyComponent extends Component {\n  // ...\n}\nexport default kea({ /* options */ })(MyComponent)\n"},748:function(e,n){e.exports="key: (props) => props.id\n"},749:function(e,n){e.exports="path: (key) => ['scenes', 'homepage', 'sliders', key]\n"},750:function(e,n){e.exports="import React, { Component } from 'react'\nimport { kea } from 'kea'\n\n@kea({\n  key: (props) => props.id,\n  path: (key) => ['scenes', 'something', key],\n\n  actions: () => ({\n    someAction: (id) => ({ id })\n  }),\n\n  reducers: ({ actions }) => ({\n    myValue: [0, PropTypes.number, {\n      [actions.someAction]: (state, payload): payload.id\n    }]\n  })\n\n  // other options, see the api docs for kea(options):\n  // - constants, selectors, connect\n  // - start, stop, takeEvery, takeLatest, workers, sagas\n})\nexport default class MyComponent extends Component {\n  render () {\n    const { myValue } = this.props\n    const { someAction } = this.actions\n\n    return (\n      <button onClick={() => someAction(12)}>{myValue}</button>\n    )\n  }\n}\n"},751:function(e,n){e.exports="import React, { Component } from 'react'\nimport { connect } from 'kea'\n\nimport menuLogic from '../menu/logic'\n\n@connect({\n  actions: [\n    menuLogic, [\n      'openMenu',\n      'closeMenu'\n    ]\n  ],\n  props: [\n    menuLogic, [\n      'isOpen as isMenuOpen'\n    ]\n  ]\n\n})\nexport default class MyComponent extends Component {\n  render () {\n    const { isMenuOpen } = this.props\n    const { openMenu, closeMenu } = this.actions\n\n    return (\n      <button onClick={isMenuOpen ? closeMenu : openMenu}>Toggle menu</button>\n    )\n  }\n}\n"},752:function(e,n){e.exports="// Input\nactions: ({ path, constants }) => ({\n  actionWithStaticPayload: 'payload value',\n  anotherActionWithAStaticPayload: { thisIs: 'that' },\n  simpleAction: true,\n\n  actionWithDynamicPayload: (id) => ({ id }),\n  actionWithManyParameters: (id, message) => ({ id, message }),\n  actionWithObjectInput: ({ id, message }) => ({ id, message })\n})\n\n// Output\nmyRandomSceneLogic.actions == {\n  actionWithStaticPayload: () => ({ type: '...', payload: 'payload value' }),\n  anotherActionWithAStaticPayload: () => ({ type: '...', payload: { thisIs: 'that' } }),\n  simpleAction: () => ({ type: '...', payload: true }),\n\n  actionWithDynamicPayload: (id) => ({ type: '...', payload: { id } }),\n  actionWithManyParameters: (id, message) => ({ type: '...', payload: { id, message } }),\n  actionWithObjectInput: ({ id, message }) => ({ type: '...', payload: { id, message } })\n}\n"},753:function(e,n){e.exports="// Input\nconnect: {\n  actions: [\n    otherLogic, [\n      'firstAction',\n      'secondAction as renamedAction'\n    ]\n  ],\n\n  props: [\n    otherLogic, [\n      'firstProp',\n      'secondProp as renamedProp',\n      '* as allProps'\n    ],\n    // select from any redux tree node\n    (state) => state.somethingThatResolvesToAnObject, [\n      'variable',\n      'otherVariable'\n    ]\n  ]\n}\n\n// Output\nmyRandomSceneLogic.actions == {\n  firstAction: otherLogic.actions.firstAction,\n  renamedAction: otherLogic.actions.secondAction\n}\n\nmyRandomSceneLogic.selectors == {\n  firstProp: otherLogic.selectors.firstProp,\n  renamedProp: otherLogic.selectors.secondProp,\n  allProps: otherLogic.selector,\n  variable: state.somethingThatResolvesToAnObject.variable,\n  otherVariable: state.somethingThatResolvesToAnObject.otherVariable\n}\n"},754:function(e,n){e.exports="// Input\nconstants: () => ['STRING', 'OTHER_STRING']\n\n// Output\nmyRandomSceneLogic.constants == { STRING: 'STRING', OTHER_STRING: 'OTHER_STRING' }\n"},755:function(e,n){e.exports="// Input\npath: () => ['scenes', 'myRandomScene', 'logicMountPoint']\n\n// Output\nmyRandomSceneLogic.path == ['scenes', 'myRandomScene', 'logicMountPoint']\n"},756:function(e,n){e.exports="// Input\nreducers: ({ actions, path, constants }) => ({\n  reducerKey: [defaultValue, propType, {\n    // operations\n    [actions.simpleAction]: (state, payload) => state + payload // return the new state,\n    [actions.complexAction]: (state, payload) => {\n      // do more things in the block\n      return state + payload\n    },\n    [actions.noStateUsed]: (_, payload) => payload.value,\n    [actions.setToTrue]: () => true,\n    [actions.clearSomething]: () => false,\n    \"ANY_OTHER_ACTION_TYPE\": (state, payload, meta) => 'do whatever you want'\n  }, /* optional options: */ { persist: true }],\n\n  constantDefault: [constants.OTHER_STRING, PropTypes.string, {\n    [actions.clearSomething]: () => constants.STRING,\n    [actions.someOtherAction]: (_, payload) => payload.value\n  }]\n\n})\n\n// Output\nmyRandomSceneLogic.reducers == {\n  reducerKey: (initialState = defaultValue, action) => /* ... */,\n  constantDefault: (initialState = constants.OTHER_STRING, action) => /* ... */,\n}\nmyRandomSceneLogic.reducer == combineReducers(reducers)\n"},757:function(e,n){e.exports="// Input\nsagas: [saga1, saga2]\n\n// Output\nmyRandomSceneLogic.saga == function * () {\n  yield fork(saga1)\n  yield fork(saga2)\n\n  // start() ...\n}\n"},758:function(e,n){e.exports="// Input\nselectors: ({ path, constants, actions, selectors }) => ({\n  selectorName: [\n    () => [selectors.inputSelector1, selectors.inputSelector2],\n    (input1, input2) => createOutput(input),\n    returnPropType\n  ],\n\n  computedValue: [\n    () => [selectors.reducerKey, selectors.constantDefault],\n    (reducerKey, constantDefault) => {\n      return complicatedOperation(reducerKey, constantDefault)\n    },\n    PropTypes.object\n  ]\n})\n\n// Output\nmyRandomSceneLogic.selectors == {\n  // all reducer keys first,\n  reducerKey: (state) => state.scenes.myRandomScene.index.reducerKey,\n  constantDefault: (state) => state.scenes.myRandomScene.index.constantDefault,\n\n  // other defined selectors\n  selectorName: (state) => memoizedSelectorForSelectorName(state),\n  computedValue: (state) => memoizedSelectorForComputedValue(state)\n}\n\nmyRandomSceneLogic.selector == (state) => ({\n  reducerKey: state.scenes.myRandomScene.index.reducerKey,\n  constantDefault: state.scenes.myRandomScene.index.constantDefault,\n  selectorName: memoizedSelectorForSelectorName(state),\n  computedValue: memoizedSelectorForComputedValue(state)\n})\n"},759:function(e,n){e.exports="// Input\nstart: function * () {\n  // saga started or component mounted\n  console.log(this)\n}\n\n// Output\nmyRandomSceneLogic.saga == function * () {\n  // saga started or component mounted\n  console.log(this)\n  // => { actions, workers, path, key, get: function * (), fetch: function * () }\n}\n"},760:function(e,n){e.exports="// Input\nstop: function * () {\n  // saga cancelled or component unmounted\n}\n\n// Output\nmyRandomSceneLogic.saga == function * () {\n  try {\n    // start()\n  } finally {\n    if (cancelled()) {\n      // saga cancelled or component unmounted\n    }\n  }\n}\n"},761:function(e,n){e.exports="// Input\ntakeEvery: ({ actions, workers }) => ({\n  [actions.simpleAction]: function * () {\n    // inline worker\n  },\n  [actions.actionWithDynamicPayload]: workers.dynamicWorker\n})\n\n// Output\nmyRandomSceneLogic.saga == function * () {\n  // pseudocode\n  yield fork(function * () {\n    yield [\n      takeEvery(actions.simpleAction.toString(), function * () {\n        // inline worker\n      }.bind(this)),\n      takeEvery(actions.actionWithDynamicPayload.toString(), workers.dynamicWorker.bind(this))\n    ]\n  })\n}\n"},762:function(e,n){e.exports="// Input\ntakeLatest: ({ actions, workers }) => ({\n  [actions.simpleAction]: function * () {\n    // inline worker\n  },\n  [actions.actionWithDynamicPayload]: workers.dynamicWorker\n})\n\n// Output\nmyRandomSceneLogic.saga == function * () {\n  // pseudocode\n  yield fork(function * () {\n    yield [\n      takeLatest(actions.simpleAction.toString(), function * () {\n        // inline worker\n      }.bind(this)),\n      takeLatest(actions.actionWithDynamicPayload.toString(), workers.dynamicWorker.bind(this))\n    ]\n  })\n}\n"},763:function(e,n){e.exports="// scenes/my-random-scene/logic.js\nimport { kea } from 'kea'\n\nimport otherLogic from './other-logic.js'\n\nexport default kea({\n  connect: {\n    actions: [\n      otherLogic, [\n        'firstAction',\n        'secondAction as renamedAction'\n      ]\n    ],\n\n    props: [\n      otherLogic, [\n        'firstProp',\n        'secondProp as renamedProp',\n        '* as allProps'\n      ],\n      // select from any redux tree node\n      (state) => state.somethingThatResolvesToAnObject, [\n        'variable',\n        'otherVariable'\n      ]\n    ]\n  },\n\n  path: () => ['scenes', 'myRandomScene', 'index'],\n\n  constants: () => ['STRING', 'OTHER_STRING'],\n\n  actions: ({ path, constants }) => ({\n    actionWithStaticPayload: 'payload value',\n    anotherActionWithAStaticPayload: { thisIs: 'that' },\n    simpleAction: true,\n\n    actionWithDynamicPayload: (id) => ({ id }),\n    actionWithManyParameters: (id, message) => ({ id, message }),\n    actionWithObjectInput: ({ id, message }) => ({ id, message })\n  }),\n\n  reducers: ({ actions, path, constants }) => ({\n    reducerKey: [defaultValue, propType, {\n      // operations\n      [actions.simpleAction]: (state, payload) => state + payload // return the new state,\n      [actions.complexAction]: (state, payload) => {\n        // do more things in the block\n        return state + payload\n      },\n      [actions.noStateUsed]: (_, payload) => payload.value,\n      [actions.setToTrue]: () => true,\n      [actions.clearSomething]: () => false,\n      \"ANY_OTHER_ACTION_TYPE\": (state, payload, meta) => 'do whatever you want'\n    }, /* optional options: */ { persist: true }],\n\n    constantDefault: [constants.OTHER_STRING, PropTypes.string, {\n      [actions.clearSomething]: () => constants.STRING,\n      [actions.someOtherAction]: (_, payload) => payload.value\n    }]\n  }),\n\n  selectors: ({ path, constants, actions, selectors }) => ({\n    selectorName: [\n      () => [selectors.inputSelector1, selectors.inputSelector2],\n      (input1, input2) => createOutput(input),\n      returnPropType\n    ],\n\n    computedValue: [\n      () => [selectors.reducerKey, selectors.constantDefault],\n      (reducerKey, constantDefault) => {\n        return complicatedOperation(reducerKey, constantDefault)\n      },\n      PropTypes.object\n    ]\n  }),\n\n  // saga functions\n\n  start: function * () {\n    // saga started or component mounted\n    console.log(this)\n  },\n\n  stop: function * () {\n    // saga cancelled or component unmounted\n  },\n\n  takeEvery: ({ actions, workers }) => ({\n    [actions.simpleAction]: function * () {\n      // inline worker\n    },\n    [actions.actionWithDynamicPayload]: workers.dynamicWorker\n  }),\n\n  takeLatest: ({ actions, workers }) => ({\n    [actions.actionWithStaticPayload]: function * () {\n      // inline worker\n    },\n    [actions.actionWithManyParameters]: workers.dynamicWorker\n  }),\n\n  workers: {\n    * dynamicWorker (action) {\n      const { id, message } = action.payload // if from takeEvery/takeLatest\n      // reference with workers.dynamicWorker\n    },\n    longerWayToDefine: function * () {\n      // another way to define a worker\n    }\n  },\n\n  sagas: [saga1, saga2]\n})\n\n// index.js\nimport myRandomSceneLogic from 'scenes/my-random-scene/logic'\n"},764:function(e,n){e.exports="// Input\nworkers: {\n  * dynamicWorker (action) {\n    const { id, message } = action.payload // if from takeEvery/takeLatest\n    // reference with workers.dynamicWorker\n  },\n  longerWayToDefine: function * () {\n    // another worker\n  }\n}\n\n// Output\nmyRandomSceneLogic.workers == {\n  dynamicWorker: function (action) *\n    const { id, message } = action.payload // if from takeEvery/takeLatest\n    // reference with workers.dynamicWorker\n  }.bind(myRandomSceneLogic),\n\n  longerWayToDefine: function () * {\n    // another worker\n  }.bind(myRandomSceneLogic)\n}\n"},765:function(e,n){e.exports="import { keaReducer } from 'kea'\nimport { combineReducerse, createStore } from 'redux'\n\nconst reducers = combineReducers({\n  kea: keaReducer('kea'),\n  scenes: keaReducer('scenes'),\n  // ... other reducers you might have\n})\n\nconst store = createStore(reducers)\n"},766:function(e,n){e.exports="import { keaReducer, keaSaga } from 'kea'\n\nconst reducers = combineReducers({\n  scenes: keaReducer('scenes'),\n  // ... other reducers you might have\n})\n\nconst sagaMiddleware = createSagaMiddleware()\nconst finalCreateStore = compose(\n  applyMiddleware(sagaMiddleware),\n  // other middleware\n)(createStore)\n\nconst store = finalCreateStore(reducers)\n\nsagaMiddleware.run(keaSaga)\n"},937:function(e,n,t){t(184),t(182),t(183),t(185),t(186),e.exports=t(181)}},[937]);