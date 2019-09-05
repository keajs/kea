**Updated 2019/06/18 with changes for `1.0.0-rc.1`**

**Updated 2019/06/13 with changes for `1.0.0-beta.31`**

**Updated 2019/04/28 with changes for `1.0.0-beta.15`**

# What is Kea?

If you're new to Kea, read this document for an introduction: _What is Kea and why you should be excited about it!_. (**TODO**)

It describes what is Kea from first principles. Thus if you have never heard of Kea before, it's a good place to start. If you are already using Kea, check it out anyway, as it explains what makes the 1.0 release so special.

Read below to see what changed compared to 0.28.7 in order to upgrade your apps.

# Kea 1.0 changes

## Status

Kea 1.0 is a *complete rewrite* of 0.28, adding all the features below while [retaining the bundle size](https://bundlephobia.com/result?p=kea@1.0.0-rc.3).

There are *almost* no breaking changes in the API for `kea()` and `connect()` calls. Most of the user facing changes have to do with the setup of Kea and with the plugin architecture. 

Oh, and we have hooks now! :tada:

Follow along in [this issue](https://github.com/keajs/kea/issues/98) to be informed about progress towards 1.0-FINAL.

## What changed?

### Breaking: logic.actions are bound automatically (from `1.0.0-rc.4`)

If you `connect` to actions in your components, use then via hooks or use an auto-binding side effect library like kea-thunk, nothing changes for you.

However if you access `logic.actions` directly and do this, you need to refactor your code a bit:

```js
const logic = kea({ actions: () => ({ doSomething: true }) })

// somewhere later in the code:
store.dispatch(logic.actions.doSomething())
```

Starting with `1.0.0-rc.4`, this would call the `doSomething` action twice. That's because `logic.actions.doSomething` already runs `dispatch()` itself... and dispatch returns the action that was dispatched.

The correct way is to just run the action without dispatching or dispatch the raw `logic.actionCreators.doSomething`:

```js
const logic = kea({ actions: () => ({ doSomething: true }) })

// the following two lines are identical:
logic.actions.doSomething()
store.dispatch(logic.actionCreators.doSomething())
```

To recap, nothing changes if you just `connect` to actions and use them in your components, use hooks or if you use a library that automatically binds the action creators, like `kea-thunk`. 

The only breaking changes happen if you import a logic and use its `.actions` object directly.


### Selectors have store.getState() as the default param (from `1.0.0-rc.3`)

If you are used to using `logic.selectors` directly, 

```js
const logic = kea({ ... })

// the following lines return identical values
logic.selectors.someValue(store.getState())
logic.selectors.someValue()
```

### Values (from `1.0.0-rc.3`)

To reduce even more boilerplate, you can now use `logic.values` to get the state of the logic's values at this moment.

```js
const logic = kea({ ... })

// the following lines return identical values
logic.selectors.someValue(store.getState())
logic.selectors.someValue()
logic.values.someValue
```

The methods inside logic.values are actually getters, so they will be different every time when called.

Values are great to use with [kea-listeners](https://github.com/keajs/kea-listeners):

```js
kea({
  listeners: ({ actions, values }) => ({
    // action that conditionally calls another action
    [actions.openUrl]: ({ url }) => { 
      // get the value from the reducer 'url'
      const currentUrl = values.url

      if (url !== currentUrl) {
        actions.reallyOpenTheUrl(url)
      }
    }
  })
})
```

### Renaming: connect.props -> connect.values (from `1.0.0-rc.4`)

Using `connect({ props: [] })` made sense when the connection was then directly passed to a react component as props. However with the introduction of the `values` object above and the `useValues` hook below, it makes sense to use the same term also in connect. 

So, starting from `1.0.0-rc.4`, you should use `connect({ values: [] })` instead. Using `props` here will still work. It will get deprecation warnings in 1.1 and be removed in 2.0.

### Hooks.

NB! Since `props` mean something different for kea and react in functional components, the previous `useProps` and `useAllProps` hooks have been renamed `useValues` and `useAllValues` in `1.0.0-rc.4`.

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

function NameComponent () {
  const { name } = useValues(logic)
  const { updateName } = useActions(logic)

  return (
    <div>
      <div>Name: {name}</div>
      <button onClick={() => updateName('George')}>Change</button>
    </div>
  )
}
```

That's all there is to it. No more magic strings inside `connect({ props: [] })`. Just destructure what you get from `useValues` and `useActions` and you're done.

Since these are hooks, you should follow the [rules of hooks](https://reactjs.org/docs/hooks-rules.html) and only define them at the top of your component.

In addition, you **must** directly destructure what `useValues(logic)` returns and not store it in an object to use later. To do that, use `useAllValues(logic)` instead. See below for details.

Using hooks, the logic is automatically mounted and unmounted together with your component.

#### Additional hooks

In addition to `useValues` and `useActions` there are 3 other Hooks:

* `useMountedLogic(logic)` - if you want to mount/unmount a logic manually with your component without fetching any props/actions from it, use this. An example use case is to start/stop sagas with your component. Combine it with `useKea` below for inline sagas!

* `useAllValues(logic)` - the default `useValues` hook can **only** be used to destructure the values when getting them like in the example above. If you need to store all the values of a logic in an object for use later, use `const values = useAllValues(logic)` instead. This is because `useValues` actually returns [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) that call `react-redux`'s [useSelector](https://react-redux.js.org/next/api/hooks#useselector) hook under the hood.

* `useKea(input, deps = [])` - calling `const logic = kea(input)` inside a React function will create a new logic every render, forgetting the state of the old one. That's not what you want. Use `const logic = useKea(input)` instead if you want to define new logic inside your functional component.

```js
function NameComponent () {
  const logic = useKea({
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['Bob', {
        [actions.updateName]: (_, payload) => payload.name
      }]
    })
  })

  const { name } = useValues(logic)
  const { updateName } = useActions(logic)

  return (
    <div>
      <div>Name: {name}</div>
      <button onClick={() => updateName('George')}>Change</button>
    </div>
  )
}
```

### Lazy logic

In `0.28`, when you called `logic = kea({})`, we would immediately build the actions, reducers, selectors, sagas, etc and directly attach the logic to the Redux store. We would also never clean up after a logic was no longer in use, except for stopping sagas when components unmounted.

This system has been completely revamped.

Kea's logic is now lazy by default. We automatically mount it when wrapping React components or use the hooks above... and we clean up after.

### Setup changes

#### Context

If you call `logic = kea({})`, we now store very little on the `logic` variable (called a logic wrapper) itself. Instead we keeps all data on a separate context. A blank default context is automatically created when you import `kea`. However you probably want more control and have to tweak the context directly. For example to add plugins, defaults, etc.

The best way it do it is to call `resetContext` at the top of your app.

```js
resetContext({
  plugins: [sagaPlugin, localStoragePlugin],
  // other options like defaults, plugin config, redux strategy, debug mode, etc
})
```

This greatly helps with server side rendering, as you have just one command to call to clean the cache for the next render.

#### getStore() is no longer needed

Previously you initialized kea when creating the redux store with `getStore()` or even manually. Now kea is initalized with the context, so we could even build a redux store right then.

Just do:

```js
resetContext({
  createStore: { /* `true` or arguments for the old getStore if any */ }
})
```

and then in your `<App />` fetch the store from the context:

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

You can still use `getStore()` like before, just move the `plugins` key to `resetContext`.

If you were setting up the store manually and attaching `keaReducer`s to it, place it after creation on Kea's context with:

```js
getContext().store = store
```

#### New setup instructions

This means that to setup kea, all you need to do is:

1. Call `resetContext()` somewhere high up in your app with all the plugins and options that you need. It no longer needs to be before the `kea()` calls, just before you start to render.
2. Get the `store` from `getContext()` and pass it to react-redux's `<Provider>` that wraps your `<App />`.

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

This logic is then attached to redux and the data is passed on to your React components when requested.

This build process is now completely extendable. In fact, the core of kea itself is now implemented [as a plugin](https://github.com/keajs/kea/blob/master/src/core/index.js).

You may create plugins that inject functionality between any of the build steps (`actions`, `selectors`, etc), define your own build steps that other plugins can then hook up to (`sagas`, `listeners`)... and listen in to any other kea event (`afterBuild`, `afterMount`, `afterOpenContext`, `beforeRender`, etc)

Until we have better documentation, the [plugins/index.js](https://github.com/keajs/kea/blob/master/src/plugins/index.js) file serves as the source of truth for this.

I'm excited to see what you can come up with.

#### Removed local plugins

All plugins must now be defined on the context. You can no longer define individual plugins that run only on one logic store. `kea({ plugins: [doMagic] })` is thus no longer allowed.

Instead, the recommended approach is to define all your plugins on the context and use only activate them if the input matches certain conditions (e.g. a `takeEvery` function is defined on the input).

### Build with props (replaces `logic.withKey`)

**TL;DR:** Use `logic(props)` to build keyed logic with custom props. This operation is fast and you can do it as much as you like.

Long version:

Assuming you have a logic with a key:

```js
const faqLogic = kea({
  key: props => props.id,
  path: (key) => ['scenes', 'faq', id],
  actions: () => ({
    show: true,
    hide: true,
  }),
  reducers: ({ actions }) => ({
    isVisible: [false, {
      [actions.show]: () => true,
      [actions.hide]: () => false
    }]
  })
})
```

*(See the point "Much much simpler dynamic/keyed logic" below if you're wondering where did `payload.key === key` go from the reducer...)*

Let's build a `FaqComponent` that gets its fields its parent, but wants to show/hide itself dynamically:

```js
function FaqComponent ({ title, body, isVisible, actions: { show, hide } }) {
  return (
    <div>
      <h1>{title}</h1>
      {isVisible && <div>{body}</div>}
      <button onClick={isVisible ? hide : show}>]
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
const ConnectedFaqComponent = logic(FaqComponent)

function AllFaqs () {
  const faqs = [ /* { id, title, body }, ... */ ]

  return (
    <div>
      {faqs.map(faq => (
        <ConnectedFaqComponent key={id} {...faq} />
      ))}
    </div>
  )
}
```

This works. With hooks the same code looks like this:

```js
function FaqComponent ({ id, title, body }) {
  const builtLogic = logic({ id }) // this is new!

  const { isVisible } = useValues(builtLogic)
  const { show, hide } = useActions(builtLogic)

 return (
    <div>
      <h1>{title}</h1>
      {isVisible && <div>{body}</div>}
      <button onClick={isVisible ? hide : show}>]
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

function AllFaqs () {
  const faqs = [ /* { id, title, body }, ... */ ]

  return (
    <div>
      {faqs.map(faq => (
        <FaqComponent key={id} {...faq} />
      ))}
    </div>
  )
}
```

Passing props to `logic` builds it with those props attached. If your logic uses keys to initialize different versions based on the props, this is how you now do it.

In addition to the props that are used to create the key, you can pass whichever other props
and they will be accesible from within the logic itself, for example as default values to reducers:


```js
const faqLogic = kea({
  key: props => props.id,
  path: (key) => ['scenes', 'faq', id],
  actions: () => ({
    show: true,
    hide: true,
    editTitle: title => ({ title })
  }),
  reducers: ({ actions, props }) => ({
    isVisible: [false, {
      [actions.show]: () => true,
      [actions.hide]: () => false
    }],
    title: [props.title || '', { // defaults to the title in the props
      [actions.editTitle]: (_, payload) => payload.title
    }]
  })
})
```

### Connect can be a function

If you need to connect to logic with a key, you can now use the `{ connect: props => ({ }) }` format of connect:

```js
const faqImageLogic = kea({
  connect: ({ id }) => ({
    values: [
      faqLogic({ id }), ['isVisible']
    ]
  }),
  // other logic for the image...
})

function RawFaqImage ({ id, title, isVisible }) {
  if (!isVisible) {
    return null
  }
  return <img src={`/img/${id}.jpg`} alt={title} />
}

const FaqImage = faqImageLogic(RawFaqImage)

function AllFaqs () {
  const faqs = [ /* { id, title, body }, ... */ ]

  return (
    <div>
      {faqs.map(faq => (
        <>
          <FaqImage key={id} {...faq} />
          <FaqComponent key={id} {...faq} />
        </>
      ))}
    </div>
  )
}
```

### New defaults API

#### Default values via selectors on reducers

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

#### Defaults with a new interface

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

#### Defaults on the context (deprecating preloadedState for kea)

To define defaults on the context, use the `defaults` key and an optional `flatDefaults` boolean:

```js
resetContext({
  defaults: {
    scenes: {
      sceneName: {
        index: {
          key1: 'value1',
          key2: 'value2',
          key3: 'value3'
        }
      }
    }
  }
})
```

or 

```js
resetContext({
  defaults: {
    'scenes.sceneName.index': {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3'
    }
  },
  flatDefaults: true
})
```

For a while kea has supported passing the `preloadedState` key to `getStore()` in order to initialize the state.

Because logic is now lazy by default, we can't rely on what was in the Redux to still be there when the logic mounts. 

Preloaded state for non-kea reducers (e.g. `router`) will still work without issues.

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

### Use (mount) without React

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

For keyed logic, you need to add a build step:

```js
const { store } = getContext()

const logic = kea({ key: ({ id }) => id, /* some actions and reducers */})

const builtLogic = logic({ id: 12 })

const unmount = builtLogic.mount()

store.dispatch(builtLogic.actions.someAction('value'))
const state = builtLogic.selectors.getValue(store.getState())

unmount()
```

Alternatively pass a callback to `mount(callback)` to execute it and unmount directly:

```js
const { store } = getContext()

const logic = kea({ key: ({ id }) => id, /* some actions and reducers */})

const result = logic({ id: 12 }).mount(builtLogic => {
  store.dispatch(builtLogic.actions.someAction('value'))
  const state = builtLogic.selectors.getValue(store.getState())

  return state
})
```

This callback can even be `async`.

### Track mounting and un-mounting of logic stores internally

Kea now keeps track of what logic is currently in use (rendered on the screen) and which is not.

This greatly helps plugin authors. For example `kea-saga` needed to integrate this tracking itself, greatly increasing the complexity of the code... and relying on dark magic to make it work. 

Now for example to start or stop sagas when a component mounts, it just integrates the plugin hooks `afterMount(pathString, logic)` and `afterUnmount(pathString, logic)`.

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

### Direct access to constants no longer supported on keyed logic

This still works:

```js
const logic = kea({
  constants: () => ['SOMETHING', 'BLABLA']
})

logic.constants == { SOMETHING: 'SOMETHING', BLABLA: 'BLABLA' }
```

This used to work, but is no longer supported:

```js
const logic = kea({
  key: props => props.id,
  constants: () => ['SOMETHING', 'BLABLA']
})

logic.constants == undefined
```

You may still use constants from within the logic in dynamic logic, for example with reducers:

```js
const logic = kea({
  key: props => props.id,
  constants: () => ['SOMETHING', 'BLABLA'],
  reducers: ({ constants }) => ({
    bla: [contants.SOMETHING, { ... }]
  })
})
```

Simply you can no longer directly access constants on unbuilt keyed logic as a property.

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
  connect: { values: [logic, '* as root'] }
})
```

### New plugins coming:

These are in incubation for now and will be released soon. Either with 1.0 or soon after.

#### kea-next

Next.js will be an officially first class citizen with Kea 1.0. I'm porting the [https://kea.js.org/](kea.js.org) website over to it. See [this repository](https://github.com/keajs/kea-next-test/) and its issue for the current status.

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

It's pretty crude at this point and might come out post 1.0. Proper pattern matching will come later.

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

`kea-saga`, `kea-thunk` and `kea-localstorage` have been upgraded to work with the latest 1.0 RC.

### Many edge case bugs are solved

You don't want to know :).

## How to test?

Make sure you're running `react-redux` version 7.1 or later and `react` version `16.8.3` or later.

Upgrade all your packages to the latest RC (kea) or beta (plugins) versions:

- kea: ![kea](https://img.shields.io/npm/v/kea/beta.svg)
- kea-saga: ![kea](https://img.shields.io/npm/v/kea-saga/beta.svg)
- kea-thunk: ![kea](https://img.shields.io/npm/v/kea-thunk/beta.svg)
- kea-localstorage: ![kea](https://img.shields.io/npm/v/kea-localstorage/beta.svg)

... and then please report if it works fine, what broke, did you notice any performance or other issues, etc.

I've been running a [large production webapp](https://www.apprentus.com) on the latest 1.0 beta now for a while and so far so good. 
