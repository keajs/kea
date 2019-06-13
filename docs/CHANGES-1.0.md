**Updated 2019/06/13 with changes for `1.0.0-beta.31`**

**Updated 2019/04/28 with changes for `1.0.0-beta.15`**

# Kea 1.0 changes

## Status

Kea 1.0 is a complete rewrite of what came before, adding all the features below while [retaining the bundle size](https://bundlephobia.com/result?p=kea@1.0.0-beta.31).

The latest beta (`1.0.0-beta.31`) is already very usable, but will still go through a bit of refactoring and performance tuning before the first RC is out. There is a bit of work still to be done with hooks as well.

Here is a description of some of the changes.

Follow along in [this issue](https://github.com/keajs/kea/issues/98) to be informed about progress.

## What changed?

### Hooks.

```js
const logic = kea({
  actions: () => ({
    updateName: name => ({ name })
  }),
  reducers: ({ actions }) => ({
    name: ['Bob', {
      [actions.updateName]: (_, payload) => payload.name
    }]
  })
})

function NameComponent (props) {
  const { name } = useProps(logic)
  const { updateName } = useActions(logic)

  return (
    <div>
      <div>Name: {name}</div>
      <button onClick={() => updateName('George')}>Change</button>
    </div>
  )
}
```

That's all there is to it. 

The logic is automatically mounted and unmounted with the component when you access it through hooks.

Currently we don't support hooks with keyed logic. That will change with one of the next beta releases.

### Lazy logic by default

In `0.28`, when you called `logic = kea({})`, we would immediately build the actions, reducers, selectors, sagas, etc and directly attach the logic to the Redux store. We would also never clean up after a logic was no longer in use, except for stopping sagas when components unmounted.

This system has been completely revamped.

Kea's logic is now lazy by default. We automatically mount it when wrapping React components or use the hooks above... and we clean up after.

### Context

If you call `logic = kea({})`, we now store very little on the `logic` variable itself. Instead it keeps all its data on a context. A blank context is automatically created when you import `kea`, however sometimes you want more control and need to tweak the context directly. For example to add plugins, initial data, etc.

The best way it do it is to call `resetContext` at the top of your app.

```js
resetContext({
  plugins: [sagaPlugin, localStoragePlugin],
  // other options like defaults, plugin config, redux strategy, debug mode, etc
})
```

This greatly helps with server side rendering, as you have just one command to call to clean the cache for the next render.

### getStore() is no longer needed

Previously you initialized kea when creating the redux store with `getStore()` or even manually. Now kea is initalized with the context, so we could even build a redux store right then.

Just pass `createStore: { /* true or arguments for getStore if any */ }` to `resetContext` and then in your `<App />` you can just do:

```js
function App ({ children }) {
  const { store } = getContext()
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
)
```

### Everything is a plugin

Starting with 1.0 you may consider Kea as an **extendable logic engine for frontend development**. 

The core of Kea is a system that converts input like this:

```js
const logic = kea({
  actions: () => ({}),
  reducers: () => ({}),
  selectors: () => ({}),
})
```

into logic like this:

```js
logic.actions = { ... }
logic.defaults = { ... }
logic.reducers = { ... }
logic.reducer = function() {}
logic.selectors = { ... }
```

This logic is then connected with redux and the data is passed on to your React components when requested.

It is now built in a completely extendable way. In fact, the core of kea itself is now implemented [as a plugin](https://github.com/keajs/kea/blob/master/src/core/index.js).

You may create plugins that inject functionality between any of the build steps (`actions`, `selectors`, etc), define your own build steps that other plugins can then hook up to (`sagas`, `listeners`)... and listen in to any other kea event (`afterBuild`, `afterMount`, `afterOpenContext`, `beforeRender`, etc)

Until we have better documentation, the [plugins/index.js](https://github.com/keajs/kea/blob/master/src/plugins/index.js) serves as the source of truth for this.

I'm excited to see what you can come up with.

### Default values via selectors

You may now use *`selectors` as default values* in reducers and they will be used when the logic mounts. Using `props` here will work as well.

```js
  kea({
    reducers: ({ actions, props, selectors }) => ({
      connectedName: [selectors.storedName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      directName: [randomStore.selectors.storedName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      propsName: [props.defaultName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })
```

### Defaults with a new interface

You may also **optionally** define defaults for reducers using a new syntax:

```js
kea({
  defaults: {
    connectedName: 'george',
    directName: 'michael'
  }
})
```

you may use selectors here as well:

```js
kea({
  defaults: ({ selectors }) => ({
    connectedName: selectors.storedName,
    directName: randomStore.selectors.storedName
  })
})
```

or use one selector to fetch them all

```js
kea({
  defaults: ({ selectors }) => (state, props) => ({
    connectedName: selectors.storedObject(state, props).name, // returning a value
    directName: randomStore.selectors.storedName // just returning a selector
  })
})
```

usually you would use it like this:

```js
kea({
  defaults: ({ selectors }) => selectors.initialStateFromSomewhere
})
```

Defaults defined via `defaults` hold priority to those defined as the first argument in `reducers`. 

You still need to define some default value (and optionally a proptype) inside reducers. You can just now overwrite them with other data as needed with the `defaults` api.

### Extend logic

Up until a logic has been built and mounted, you can extend it:

```js
const logic = kea({
  actions: () => ({
    increment: (amount = 1) => ({ amount }),
    decrement: (amount = 1) => ({ amount })
  }),

  reducers: ({ actions }) => ({
    counter: [0, {
      [actions.increment]: (state, payload) => state + payload.amount,
      [actions.decrement]: (state, payload) => state - payload.amount
    }]
  }),
})

logic.extend({
  reducers: ({ actions }) => ({
    negativeCounter: [0, {
      [actions.increment]: (state, payload) => state - payload.amount,
      [actions.decrement]: (state, payload) => state + payload.amount
    }]
  }),
})

Object.keys(logic.reducers) == ['counter', 'negativeCouter']
```

Logic can also be extended like this from within certain events in plugins.

### Use without React

If you have set up a kea context and connected to Redux, you can use kea without React.

```js
// get the redux store
const { store } = getContext()

// initialize some logic
const logic = kea({ /* some actions and reducers */})

// attach the logic to redux and return a function that cleans up
const unmount = logic.mount()

// dispatch an action and use a selector
store.dispatch(logic.actions.someAction('value'))
const state = logic.selectors.getValue(store.getState())

// clean up and disconnect from the store
unmount()
```

### Track mounting and un-mounting of logic stores internally

Kea now keeps track of what logic is currently in use (rendered on the screen) and which is not.

This greatly helps plugin authors. For example `kea-saga` needed to integrate this tracking itself, greatly increasing the complexity of the code... and relying on dark magic to make it work. 

Now for example to start or stop sagas when a component mounts, it just integrates the plugin hooks `afterMounted(pathString, logic)` and `afterUnmount(pathString, logic)`.

### Preloaded state not supported for kea reducers

For a while kea has supported passing the `preloadedState` key to `getStore()` in order to initialize the state.

Because of the new way we track mounting and unmounting of logic in `1.0.0-beta.14`, we can no longer rely on using `preloadedState` to inject defaults into kea logic. Instead you must use the new `defaults` key as described above.

Preloaded state for non-kea reducers (so `router` in the example above) will still work without issues.

It is however possible to initialise the defaults for logic based on data given to `preloadedState` with [a simple plugin](https://gist.github.com/mariusandra/770901945874dacd4fea3ab4cdf9b7d5).

We might have support for setting defaults on the context without a plugin. Stay tuned.

### Much much simpler dynamic/keyed logic

Previously if you used many keyed logic, you probably ran into cases where you had to check `payload.key === key` everywhere. For example:

```js
kea({
  key: (props) => props.id,
  path: (key) => ['scenes', 'counterDynamic', 'counter', key],

  actions: () => ({
    increment: (amount = 1) => ({ amount }),
    decrement: (amount = 1) => ({ amount })
  }),

  reducers: ({ actions, key, props }) => ({
    counter: [0, PropTypes.number, {
      // don't do this anymore
      [actions.increment]: (state, payload) => payload.key === key ? state + payload.amount : state,
      [actions.decrement]: (state, payload) => payload.key === key ? state - payload.amount : state
    }]
  }),
})
```

Or worse, in saga workers:

```js
kea({
  workers: {
    doSomething: function * (action) {
      if (action.payload.key !== key) { // don't do this anymore
        return
      } 
      // do stuff
    }
  }
})
```

This is no longer necessary. 

Now all actions created by every individual keyed logic are unique and **`action.payload.key` doesn't exist anymore**.

This does mean that you can't share actions between keyed logic like you could before. If you still need actions that are common to all instances of one keyed logic, create them in a separate `kea({})` call and connect to them from your keyed logic.

### Removed `selectors.root`

If you are using `logic.selectors.root` anywhere, switch to `logic.selector`.

Similarly, change code like this:

```js
kea({
  connect: { props: [logic, 'root'] }
})
```
to this:

```js
kea({
  connect: { props: [logic, '* as root'] }
})
```

### New plugins coming:

These are in incubation for now and will be released soon. Either with 1.0 or soon after.

#### kea-next

Next.js will be an officially first class citizen with Kea 1.0. I'm porting the [https://kea.js.org/](kea.js.org) website over to it.

#### kea-listeners

Similar to `takeEvery` in `kea-saga`, listeners listen for actions and let you run and dispatch code after they run:

```js
  kea({
    listeners: ({ actions, selectors }) => ({ 
      [actions.updateName]: (action, { dispatch, getState }) => {
        console.log(action.payload)

        dispatch(actions.updateDescription('asd'))

        const description = selectors.description(getState())
        console.log(description)
      },
    })
  })
```

Listeners aims to be a lightweight general purpose plugin that other plugin authors could depend upon without incurring sizeable bundle size increases like with sagas.

#### kea-router

Built with `kea-listeners`, `kea-router` acts as a bridge between `kea`, `react-redux` and `connected-react-router`. 

```js
  kea({
    actionToUrl: ({ actions }) => ({
      [actions.selectEmail]: () => `/signup?type=email`,
      [actions.unselectEmail]: () => `/signup`,
      [actions.openLesson]: ({ id }, action) => `/open/${id}`
    }),

    urlToAction: ({ actions }) => ({
      '/signup?type=email': url => actions.selectEmail(),
      '/signup': url => actions.unselectEmail(),
      '/open/': (url) => actions.openLesson(parseInt(url.split('/')[2]))
    }),
  })
```

It's pretty crude at this point. Proper pattern matching will come later.

#### kea-immer

This is a WIP. Specify `{ immer: true }` to add mutation to your reducers:

```js
@kea({
  actions: () => ({
    increment: (amount = 1) => ({ amount }),
    decrement: (amount = 1) => ({ amount })
  }),

  reducers: ({ actions, key, props }) => ({
    counter: [{ count: 0 }, PropTypes.object, { immer: true }, {
      [actions.increment]: (state, payload) => {
        state.count += payload.amount
      },
      [actions.decrement]: (state, payload) => {
        state.count -= payload.amount
      }
    }]
  })
})
```

### Old plugins upgraded

`kea-saga`, `kea-thunk` and `kea-localstorage` have been upgraded to work with the latest 1.0 beta.

### Many edge case bugs are solved

You don't want to know :D

## How to test?

Make sure you're running `react-redux` version 7.1 or later and `react` version `16.8.3` or later.

Upgrade all your packages to the latest beta versions:

- kea: ![kea](https://img.shields.io/npm/v/kea/beta.svg)
- kea-saga: ![kea](https://img.shields.io/npm/v/kea-saga/beta.svg)
- kea-thunk: ![kea](https://img.shields.io/npm/v/kea-thunk/beta.svg)
- kea-localstorage: ![kea](https://img.shields.io/npm/v/kea-localstorage/beta.svg)

... and then please report if it works fine, what broke, did you notice any performance or other issues, etc.

I've been running a [large production webapp](https://www.apprentus.com) on the latest 1.0 beta now for a while and so far so good. 
