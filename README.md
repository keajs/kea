[![Backers on Open Collective](https://opencollective.com/kea/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/kea/sponsors/badge.svg)](#sponsors) ![NPM Version](https://img.shields.io/npm/v/kea.svg)

![Kea Logo](https://kea.js.org/img/logo.svg)

A `kea` is two things:

1. An [extremely smart mountain parrot](https://www.youtube.com/results?search_query=kea+parrot) from New Zealand.
2. An equally smart architecture for frontend webapps, built on top of React and Redux.

# Try it out

Open the [documentation](https://kea.js.org/) (AKA demo app) and [view its source on GitHub](https://github.com/keajs/kea-website).

In the documentation you will find [**several examples with source**](https://kea.js.org/). Check it out!

No, really, [check out the docs](https://kea.js.org/)!

# What is Kea?

Kea is a state management library for React. It *empowers* Redux, making it as easy to use as `setState` while retaining composability and improving code clarity.

* **100% Redux**: Built on top of [redux](http://redux.js.org/) and [reselect](https://github.com/reactjs/reselect).
* **Side effect agnostic**: use [thunks](https://kea.js.org/effects/thunk) with redux-thunk, [sagas](https://kea.js.org/effects/saga) with redux-saga or (soon!) [epics](https://github.com/keajs/kea/issues/40) with redux-observable.
* **Wrappable**: Write logic alongside React components. Easier than `setState` and perfect for small components.
* **Connectable**: Pull in data and actions through ES6+ [imports](https://kea.js.org/guide/connected). Built for large and ambitious apps.
* **No boilerplate**: Forget `mapStateToProps` and redundant constants. Only write code that matters!
* **No new concepts**: Use actions, reducers and selectors. Gradually migrate [existing Redux applications](https://kea.js.org/guide/migration).

Compare it to other state management libraries: [Kea vs setState, Redux, Mobx, Dva, JumpState, Apollo, etc.](https://medium.com/@mariusandra/kea-vs-setstate-redux-mobx-dva-jumpstate-apollo-etc-4aa26ea11d02)


## Sponsors

Thank you to all our sponsors! Your continued support makes this project possible!

<a href="https://opencollective.com/kea/sponsor/0/website" target="_blank"><img src="https://opencollective.com/kea/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/kea/sponsor/1/website" target="_blank"><img src="https://opencollective.com/kea/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/kea/sponsor/2/website" target="_blank"><img src="https://opencollective.com/kea/sponsor/2/avatar.svg"></a>

[Support this project by becoming a sponsor](https://opencollective.com/kea#sponsor). Your logo will show up here and on [kea.js.org](https://kea.js.org) with a link to your website.


# How does it work?

In Kea, you define logic stores with the `kea({})` function.

Each logic store contains `actions`, `reducers` and `selectors`.

```js
kea({
  actions: ({}) => ({ }),
  reducers: ({ actions }) => ({ }),
  selectors: ({ selectors }) => ({ })
})
```

They work just like in Redux:

* They are all pure functions (no side effects, same input = same output)
* **Actions** are functions which take an input and return a payload
* **Reducers** take actions as input and return new_data = old_data + payload
* **Selectors** take the input of multiple reducers and return a combined output

See here for a nice overview of how Redux works: [Redux Logic Flow — Crazy Simple Summary](https://medium.com/gitconnected/redux-logic-flow-crazy-simple-summary-35416eadabd8)

For example, to build a simple counter:

```js
kea({
  actions: () => ({
    increment: (amount) => ({ amount }),
    decrement: (amount) => ({ amount })
  }),

  reducers: ({ actions }) => ({
    counter: [0, PropTypes.number, {
      [actions.increment]: (state, payload) => state + payload.amount,
      [actions.decrement]: (state, payload) => state - payload.amount
    }]
  }),

  selectors: ({ selectors }) => ({
    doubleCounter: [
      () => [selectors.counter],
      (counter) => counter * 2,
      PropTypes.number
    ]
  })
})
```

The logic stores can either

1) be wrapped around your component or pure function:

```js
const logic = kea({ /* options from above */ })

class Counter extends Component {
  render () {
    const { counter, doubleCounter } = this.props
    const { increment, decrement } = this.actions

    return <div>...</div>
  }
}

export default logic(Counter)
```

2) used as decorators:

```js
@kea({ /* options from above */ })
export default class Counter extends Component {
  render () {
    return <div />
  }
}
```

or

3) imported and then connected to:

```js
// features-logic.js
import { kea } from 'kea'
export default kea({ /* options from above */ })

// index.js
import { connect } from 'kea'
import featuresLogic from 'features-logic'

@connect({
  actions: [
    featuresLogic, [
      'increment',
      'decrement'
    ]
  ],
  props: [
    featuresLogic, [
      'counter',
      'doubleCounter'
    ]
  ]
})
export default class Counter extends Component {
  render () {
    return <div />
  }
}
```

You can also connect logic stores together, to e.g:

... use actions from one logic store in the reducer of another.
... combine reducers from multiple logic stores into one selector.

Eventually you'll need side effects. Then you have a choice.

You can use simple [thunks](https://kea.js.org/effects/thunk) via redux-thunk:

```js
import 'kea-thunk'
import { kea } from 'kea'

const incrementerLogic = kea({
  actions: () => ({
    increase: true
  }),
  reducers: ({ actions }) => ({
    counter: [0, PropTypes.number, {
      [actions.increase]: (state, payload) => state + 1
    }]
  }),
  thunks: ({ actions, dispatch, getState }) => ({
    increaseAsync: async (ms) => {
      await delay(ms)
      await actions.increase()
    }
  })
})
```

.... or the more powerful [sagas](https://kea.js.org/effects/saga) via redux-saga.

(coming soon: [support for epics](https://github.com/keajs/kea/issues/40) with redux-observable)

Check out [the examples on the homepage](https://kea.js.org) or [start reading the guide](https://kea.js.org/guide/installation) for more.

If you're already using Redux in your apps, it's [really easy to migrate](https://kea.js.org/guide/migration).

# Installation

First install the packages:

```sh
# if you're using yarn
yarn add kea redux react-redux reselect

# if you're using npm
npm install kea redux react-redux reselect --save
```

Then configure the [Redux store](https://github.com/reactjs/react-redux/blob/master/docs/api.md#provider-store). You may either do it [manually](https://kea.js.org/api/store#manual) or use the `getStore` helper. We recommend using the helper, as it will also configure any installed plugins (e.g. [kea-saga](https://kea.js.org/api/saga)). You may pass additional middleware and reducers as [options](https://kea.js.org/api/store).

First, create a file called `store.js` with the following content:

```js
// store.js
import { getStore } from 'kea'

export default getStore({
  // additional options (e.g. middleware, reducers, ...)
})
```

Then import this in your app's entrypoint **before** any calls to `kea()` are made. In practice this means you should import your store before your root component.

Finally, wrap your `<App />` with Redux's `<Provider />`.

This is how your entrypoint would look like if you used `create-react-app`:

```js
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'; // <--- add this

import './index.css';

import store from './store'; // <--- add this BEFORE App
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider store={store}> // <-- add this
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
```

# Scaffolding

You may also use the CLI tool to start a new Kea project:

```
npm install kea-cli -g
kea new my-project
cd my-project
npm install # or yarn
npm start   # or yarn start
```

and open [http://localhost:2000/](http://localhost:2000/).

Later inside `my-project` run these to hack away:

```
kea g scene-name                               # new scene
kea g scene-name/component-name                # component under the scene
kea g scene-name/component-name/really-nested  # deeply nested logic
```

More documentation coming soon! Please help if you can!

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/kea/contributors.svg?width=890" /></a>


## Backers

Thank you to all our supporters! 🙏 [[Become a backer](https://opencollective.com/kea#backer)]

<a href="https://opencollective.com/kea#backers" target="_blank"><img src="https://opencollective.com/kea/backers.svg?width=890"></a>
