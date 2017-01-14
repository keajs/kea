# Change Log
All notable changes to this project will be documented in this file.

As we're at the 0.x phase, deprecations and breaking changes will still happen. They will be documented here.

Once we react 1.0 all deprecations will be removed and the project will switch to SemVer.

## 0.17.0 - 2017-01-13
### Changed
- [BREAKING] The propType is now the 3rd element in the selector array. See here how to refactor.

## 0.16.0 - 2017-01-13
### Changed
- Added `@connect` and `@initLogic` decorators. Reverse the steps [here](https://github.com/mariusandra/kea/blob/master/docs/no-decorators.md) to upgrade.

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
- Deprecated `addSelector` in favor of the new easier to read format. [See here](https://github.com/mariusandra/kea-example/commit/241d30faf8dd6d631d5d891ae3ebc3adc1c3fac3) for an example.

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
- [BREAKING] Changed format for Logic actions. Now you don't need to run the redux-act createAction() anymore and no description is needed. See the example in README.md or [this commit](https://github.com/mariusandra/kea/commit/b2b9f9037af2d1ab5beba139fdb9b8cb210f98fa) for the new format.
- Removed deprecated createLogic() function
- Exposed functions `createAction`, `createActions`, `createReducer`
- Changed format of `type` to be more readable
