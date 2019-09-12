webpackJsonp([9],{510:function(e,n,t){"use strict";function a(){return r.a.createElement("div",null,r.a.createElement("div",{className:"description"},r.a.createElement("h2",null,"Thunks"),r.a.createElement("p",null,"Thunks are simple ways to define side effects with Redux.")),r.a.createElement("div",{className:"description"},r.a.createElement("h2",null,"Installation"),r.a.createElement("p",null,"First install the ",r.a.createElement("a",{href:"https://github.com/keajs/kea-thunk"},r.a.createElement("code",null,"kea-thunk"))," and ",r.a.createElement("a",{href:"https://github.com/gaearon/redux-thunk"},r.a.createElement("code",null,"redux-thunk"))," packages:"),r.a.createElement(s.default,{className:"bash"},l.install),r.a.createElement("p",null,"Then you have install the plugin:"),r.a.createElement(s.default,{className:"javascript"},l.import)),r.a.createElement("div",{className:"description"},r.a.createElement("h2",null,"Usage"),r.a.createElement("p",null,"You define thunks in a block called ",r.a.createElement("code",null,"thunks"),". Here are some examples:"),r.a.createElement(s.default,{className:"javascript"},l.usage),r.a.createElement("p",null,"As you can see, you have access to the standard Redux ",r.a.createElement("code",null,"dispatch")," and ",r.a.createElement("code",null,"getState")," methods. However you don't need to call ",r.a.createElement("code",null,"dispatch")," before any action in the actions object. They are wrapped automatically.")))}Object.defineProperty(n,"__esModule",{value:!0}),n.default=a;var o=t(10),r=t.n(o),s=t(200),l={install:t(658),import:t(659),store:t(660),usage:t(661)}},658:function(e,n){e.exports="# if you're using yarn\nyarn add kea-thunk redux-thunk\n\n# if you're using npm\nnpm install --save kea-thunk redux-thunk\n"},659:function(e,n){e.exports="import thunkPlugin from 'kea-thunk'\nimport { resetContext } from 'kea'\n\nresetContext({\n  createStore: true,\n  plugins: [ thunkPlugin ]\n})\n"},660:function(e,n){e.exports="import { keaReducer, activatePlugin } from 'kea'\nimport { createStore, combineReducers, applyMiddleware, compose } from 'redux'\n\nimport thunkPlugin from 'kea-thunk'\n\nexport default function getStore () {\n  activatePlugin(thunkPlugin)\n\n  const reducers = combineReducers({\n    kea: keaReducer('kea'),\n    scenes: keaReducer('scenes')\n  })\n\n  const finalCreateStore = compose(\n    applyMiddleware(thunk)\n  )(createStore)\n\n  const store = finalCreateStore(reducers)\n\n  return { store }\n}\n"},661:function(e,n){e.exports="const delay = (ms) => new Promise(resolve => window.setTimeout(resolve, ms))\n\nconst logic = kea({\n  actions: ({ constants }) => ({\n    updateName: name => ({ name })\n  }),\n\n  thunks: ({ actions, dispatch, getState }) => ({\n    updateNameAsync: async name => {\n      await delay(1000)            // standard promise\n      await actions.anotherThunk() // another thunk action\n      actions.updateName(name)     // not a thunk, so no async needed\n      dispatch({ type: 'RANDOM_REDUX_ACTION' }) // random redux action\n\n      console.log(values.name) // 'chirpy'\n      console.log(values.otherKey) // undefined\n    },\n    anotherThunk: async () => {\n      // do something\n    }\n  }),\n\n  reducers: ({ actions, constants }) => ({\n    name: ['chirpy', {\n      [actions.updateName]: (state, payload) => payload.name\n    }]\n  })\n})\n"}});