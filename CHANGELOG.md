# Change Log
All notable changes to this project will be documented in this file.

## 2.4.0 - xxx
- TODO: Add `<Provider />` tag to wrap Redux's `<Provider store={getContext().store} />`
- TODO: Deprecated `resetContext`
- TODO: Rename `kea.inline` to `kea.logic`
- TODO: Fix whatever bug is happening with CRA fast refresh

## 2.3.8 - 2021-04-26
- Fix regression introduced in 2.3.5 with default keys like: `key: props => props.id || 'default'`

## 2.3.7 - 2021-04-25
- Improve types and build

## 2.3.6 - 2021-04-25
- Improve types

## 2.3.5 - 2021-04-16
- Fix issue with .mount() overriding props pased to logic inside selectors [#124](https://github.com/keajs/kea/issues/124)

## 2.3.4 - 2021-03-30
- Add types for arrays of listeners (was supported, just not typed)
- Add types for using selectors as defaults in reducers

## 2.3.3 - 2021-03-01
- Add generics to the `BuiltLogic<logicType>` and `LogicWrapper<logicType>` types.

## 2.3.2 - 2021-02-14
- Fix edge case error when removing listeners (@zshannon [#108](https://github.com/keajs/kea/pull/108/files))

## 2.3.1 - 2021-02-14
- Nicer error when accessing something in the store that doesn't exist

## 2.3.0 - 2021-02-10
- Adds `<BindLogic logic={keyedLogic} props={{ id: 12 }}>`, which passes a specific build of 
  `keyedLogic` via React Context down to nested components. This build will be used when calling
  a hook like `useValues(keyedLogic)` without props. 
  
  Essentially, you pass the props without actually passing the props. 
  
  [Read more here](https://kea.js.org/blog/kea-2.3).
  
## 2.2.2 - 2020-10-27
- Create store automatically if calling `resetContext`, except for the default initial context.

## 2.2.1 - 2020-10-27
- Improve a few types for plugins

## 2.2.0 - 2020-09-08
- [TypeScript support](https://kea.js.org/docs/guide/typescript)!
- Fix bug with the store being created twice. [#111](https://github.com/keajs/kea/issues/111)
- No other breaking changes. 

## 2.1.1 - 2020-06-14
- Read the blog post: https://kea.js.org/blog/kea-2.1
- Simplified the syntax even more! You don't need to pass `() => ({ ... })`
  to `actions`, `reducers`, etc if there's nothing you want from the logic.
  Just pass `{}` instead. 
- Simplified syntax for selectors when not using the function syntax:
```javascript
kea({ 
  selectors: { 
    doubleCounter: [
      selectors => [selectors.counter],
      (counter) => counter * 2
    ]
  }
})
```
- Listeners get the store's `previousState` as their 4th argument.
  You can use selectors (`selectors.myData(previousState)`) to get the any value as it was before the action was dispatched.

## 2.0.1 - 2020-06-05
- Fix error when calling old references to actions on unmounted logic via hooks.

## 2.0.0 - 2020-05-12
Version 2.0 brings a lot of convenience features and one breaking change. The changes are briefly 
described below. Read the announcement blog post to get more context: https://kea.js.org/blog/kea-2.0

There's also a new babel plugin you might want to check out: https://github.com/keajs/babel-plugin-kea

Finally, Kea 2.0 comes with brand new docs on [https://kea.js.org](https://kea.js.org). 
(Old docs for [1.0](https://kea-v1.netlify.app/guide/installation) and [0.28](https://5d7a15398fdb1e00073ed27f--kea-v1.netlify.app/))  

### Breaking change
- Listeners are now built in to Kea. That means if you were initialising the `listenersPlugin`
  before in `resetContext`, you need to remove it. Otherwise Kea won't start.

### Other changes
- No more need to add the `[actions.` and `]` in `[actions.yourAction]` when defining reducers and listeners
- Auto-Connect: You can now write `otherLogic.actions.doSomething()` as keys for reducers and listeners
  and inside the executable part of listeners... instead of having to `connect` the values manually.
  The logic is automatically connected and mounted if it wasn't already.
- It's possible to extend reducers with `.extend`. Before if you would define a new reducer with
  an existing name in the `extend` block, it would override the old one completely. Now thery merge
  and the actions on the old one still continue to work.
- `createStore` is now true in `resetContext`. So if you don't need to specify the key at all if you
  don't have any custom redux middleware.
- The `path` in your logic can start with anything. Previously it was just `kea` or `scenes` unless manually
  specified.
- Instead of passing an array `[default, {..}]` to a reducer, now passing an object `{..}` works and sets 
  the default to null. 

## 1.0.0 - 2019-09-12
There are too many changes to list here. See [this document](https://github.com/keajs/kea/blob/master/docs/CHANGES-1.0.md) for a complete overview!

## 0.28.0 - 2018-02-07
### New feature
- Added `logic.withKey(params => params.id)` that you can use to connect dynamic components. See [this comment](https://github.com/keajs/kea/issues/72#issuecomment-363857072) for more details.

## 0.27.0 - 2017-10-25
### Changed
- Bigger changes to the plugin system. Please upgrade all plugins (e.g. `kea-saga`) to the supported versions!
- Plugins must now be manually installed by either passing them to the `plugins` array in `getStore`, running them through `activatePlugin()` or importing from `'kea-plugin/install'`. See the README of each plugin for details.
- Some plugins can now also be installed just for individual logic stores, e.g. [`kea-localstorage`](https://github.com/kea/kea-localstorage).
- **BREAKING** Removed support for `{ persist: true }` to store the output of reducers in LocalStorage. Use the [`kea-localstorage`](https://github.com/kea/kea-localstorage) plugin to restore support for this feature.
- PropTypes are no longer necessary when defining reducers.

## 0.26.5 - 2017-10-21
### Fixed
- Only mount the reducer in redux, if there's an actual reducer or a manually given path

## 0.26.3 - 2017-10-12
### Fixed
- Now if you pass a wrapped component (`logic(Component)`) an `actions` prop, its conents be merged with the created actions prop.

## 0.26.2 - 2017-10-08
### Changed
- Add support for specifying your own compose enhancer in `getStore()`, e.g. for [remote-redux-devtools](https://github.com/zalmoxisus/remote-redux-devtools#when-to-use-devtools-compose-helper)
- A lot of code refactoring. The plugins API changed a bit, so upgrade your `kea-saga` and `kea-thunk` packages accordingly.

## 0.25.0 - 2017-09-29
### Plugin support!
- Kea now supports plugins!
- The previous saga functionality has moved to [kea-saga](https://github.com/keajs/kea-saga). Please install it to continue using sagas!
- There's a new function, [`getStore`](https://kea.js.org/api/store), which greatly simplifies configuring your store, especially when importing plugins.

### Removed deprecations
- Removed `Logic` and `Scene` classes and other old deprecated code. Please make sure your app works with 0.24.1 without warnings before upgrading!

## 0.24.2 - 2017-09-17
### Changed
- Leverage action cache to enable parameterized kea logic. See #43 for more details. By @rheng

## 0.24.1 - 2017-09-10
### Changed
- Moved CLI tools (the `kea` command line utility) to separate [`kea-cli`](https://github.com/keajs/kea-cli) package
- Added `"module"` field to `package.json` with a version that uses ESnext imports instead of `require` calls. Should decrease bundle size by ~10kb on Webpack 2+, rollup and other module bundlers that use this
- Added a [`"esnext"`](http://2ality.com/2017/06/pkg-esnext.html) field for people to opt in to the untranspiled source.

## 0.23.5 - 2017-09-06
### Changed & Fixed in the 0.23 series before 0.24
- Remove the warning if the path is not yet conencted to Redux (needed for tests)
- Rehydrate the store also for inline kea initializations (when the component has a `key`)
- Fix unmounting of sagas (cancelled was not called after start stopped)
- Add connected selectors to selectors in wrapped components
- Fix re-creation of empty `kea({})` `root` selectors for shallow comparison
- Inject proptypes to components
- Add functions to reset the store cache for tests
- Make sagas work with functional components

## 0.23.0 - 2017-08-15
### New and old deprecations
- Removed all old deprecations except for the usage of `run` and `cancelled` in sagas. These still give warnings.
- Added new deprecations for `Logic` and `Scene` classes and related code. Basically everything imported from `kea/logic` and `kea/scene` is no longer safe.
- `Saga` classes and code imported from `kea/saga` are safe for now, but you should migrate it to the unform `kea({})` syntax sooner rather than later.

When upgrading, make sure your code works with 0.22.1 without any deprecation warnings. Then upgrade to 0.23.0 and remove the new warnings.

## 0.22.0 - 2017-08-13
### Changed
- Added [`babel-runtime`](https://babeljs.io/docs/plugins/transform-runtime/). This should reduce the issues users have been
having with `create-react-app` and other situations where `regenerator` is not automatically loaded. Fixes #25.

## 0.21.0 - 2017-08-13
### Changed
- When creating actions like `actions: () => { doit: true }`, previously the payload of the action would equal `true`.
Now the payload equals `{ value: true }`. This was made so that when we inject the `key` into the payload for actions
that are defined on kea logic stores that are directly connected to the component, we would not run into errors.
[See here](https://github.com/keajs/kea-website/commit/c44e82cfa2817a297d30814fbc608197ee61227f) for more.

## 0.20.1 - 2017-08-02
### Added
- Added `props` as the second argument to input selectors when creating kea selectors

## 0.20.0 - 2017-07-31
### Changed
- Connected sagas are now automatically started, no need to pass them separately in { sagas: [] }
- A saga will not be started if one with the same path is already running

## 0.19.9 - 2017-07-24
This was a big release. A lot of code changed and we now have many deprecations which should be removed in the next releases to make the bundle smaller.

Before upgrading to any newer version (0.20, etc), make sure your code works fine with 0.19.

### Changed
- Deprecated: `run` and `cancelled` replaced with `start` and `stop` in Saga classes
- Added inline kea
- New and easier way to hook up to `redux`
- Use `this.actions` instead of `this.props.actions` in components
- Deprecated the old Logic and Saga classes in favor of the unified `kea({})` version. No warnings yet.
- Added tests for the `kea({})` version.

## 0.18.0 - 2017-05-20
### Changed
- Use `store.addKeaScene(savedScene, true)` to load scenes in the background without replacing the sagas of the "active" scene

## 0.17.1 - 2017-01-30
### Changed
- [PR4](https://github.com/keajs/kea/pull/4). Add action.meta to reducer mapping.
- [PR4](https://github.com/keajs/kea/pull/4). Upgrade takeEvery, takeLatest usage for redux-saga >= 0.14 compatibility.

## 0.17.0 - 2017-01-13
### Changed
- [BREAKING] The propType is now the 3rd element in the selector array. [See here how to refactor.](https://github.com/keajs/kea-example/commit/5df64d6c2dc3674964cc987804a8535678078103#diff-44518ef03bc2b98deccc270f728518c3)

## 0.16.0 - 2017-01-13
### Changed
- Added `@connect` and `@initLogic` decorators. Reverse the steps [here](https://github.com/keajs/kea/blob/master/docs/no-decorators.md) to upgrade.

## 0.15.4 - 2016-12-12
### Changed
- Fixed a bug with kea-cli/generate

## 0.15.2 - 2016-12-07
### Changed
- In `kea/logic`, renamed `structure = () = ({})` to `reducers = () = ({})` in order to maintain compatibility of terms with redux.
- Moved `createScene`, `NEW_SCENE`, `createCombinedSaga`, `getRoutes`, `combineScenesAndRoutes`, `createRootSaga` and `createKeaStore` from `kea/logic` to `kea/scene`
- You no longer need to use `mirrorCreator` or comparable to create constants. Just pass in an array.

## 0.14.1 - 2016-12-06
### Changed
- Deprecated `addSelector` in favor of the new easier to read format. [See here](https://github.com/keajs/kea-example/commit/241d30faf8dd6d631d5d891ae3ebc3adc1c3fac3) for an example.

## 0.13.0 - 2016-12-05
### Changed
- Deprecated `createMapping` in favor of the new compact Array structure. [See here](https://gist.github.com/mariusandra/1b8eeb3f2f4e542188b915e27133c858/2869c583f5f1b3da8121fb822eb3ad91af9b5978#file-logic-js-L25) for an example.

## 0.12.2 - 2016-12-05
### Changed
- [BREAKING] Changed the name of the project to `kea` from `kea-logic`. Please update and change `import ... from "kea-logic"` to `import ... from "kea/logic"`

### Added
- Added the `Saga` class. [Here's how to use it](https://gist.github.com/mariusandra/e6091b393e153c9edf3ba451a9d91aeb).

## 0.11.1 - 2016-11-09
### Changed
- [BREAKING] Removed dependency on redux-act
- [BREAKING] Changed format for Logic actions. Now you don't need to run the redux-act createAction() anymore and no description is needed. See the example in README.md or [this commit](https://github.com/keajs/kea/commit/b2b9f9037af2d1ab5beba139fdb9b8cb210f98fa) for the new format.
- Removed deprecated createLogic() function
- Exposed functions `createAction`, `createActions`, `createReducer`
- Changed format of `type` to be more readable
