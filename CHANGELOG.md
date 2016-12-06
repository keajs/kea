# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

As we're at the 0.x phase, breaking changes will still happen. They will be documented here.

## 0.14.0 - 2016-12-06
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
- Exposed functions `createAction`, `createActions`, `createReducer`
- Changed format of `type` to be more readable

## 0.11.0 - 2016-11-08
### Changed
- [BREAKING] Removed dependency on redux-act
- [BREAKING] Changed format for Logic actions. Now you don't need to run the redux-act createAction() anymore and no description is needed. See the example in README.md or [this commit](https://github.com/mariusandra/kea/commit/b2b9f9037af2d1ab5beba139fdb9b8cb210f98fa) for the new format.
- Removed deprecated createLogic() function
