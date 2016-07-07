The principal operation of a website is to stream data between endpoints. Bytes start at the user's keyboard, pass through layers of application logic, land in the database and return back as impeccable HTML and CSS constructions.

`kea-logic` brings your data to life on the frontend side. It uses components you know and love (`react`, `redux`, `redux-act`, `redux-saga`, `reselect`, `react-router`) to create a well-oiled machine.

[`kea`](https://github.com/mariusandra/kea) is a collection of projects intended to fix the backend as well.

# kea-logic

`kea-logic` lets you create logic stores with actions. These connect to React components and redux-sagas and carry data between them.

The logic stores are designed to be well-readable, self-documenting and easily refactorable. You'll know how it works even if you have never seen the code before.

In addition to this, `kea-logic` provides are helpers to simplify routing, code splitting and other parts of a good website.

Please check out the [example application](https://github.com/mariusandra/kea-example) ([demo](http://example.kea.rocks/)) that will be dissected below.

# Logic stores

Logic stores consist of 1) actions, 2) structure (reducer + selector + proptype), and 3) optionally sagas.

Logic stores are connected through ES6 imports.

```jsx
// scenes/homepage/index.js - This the root component for the homepage scene

import './styles.scss'

import React, { Component } from 'react'
import { connectMapping, propTypesFromMapping } from 'kea-logic'

// A helper component.
import Slider from '~/scenes/homepage/slider'

// Note, you should always import with the full path, so you can easily move things around, and refactor just by searching for the path.

// logic stores: 1) for this "homepage" scene root component and 2) the slider helper component
import sceneLogic from '~/scenes/homepage/logic'
import sliderLogic from '~/scenes/homepage/slider/logic'

// select which fields of data and which actions we want from the above imported logic stores
const mapping = {
  actions: [
    sceneLogic, [
      'updateName'
    ]
  ],
  props: [
    sceneLogic, [
      'name',
      'capitalizedName'
    ],
    sliderLogic, [
      'currentSlide',
      'currentImage'
    ]
  ]
}

// the scene component itself
class HomepageScene extends Component {
  // react will know the PropTypes automatically
  static propTypes = propTypesFromMapping(mapping, { /* extra PropTypes if needed */ })

  // binding to 'this', hence the fat arrow syntax
  // this way we can just pass onUpdate={this.updateName} in render()
  updateName = () => {
    // each function defines on top which props and actions it needs
    const { name } = this.props
    const { updateName } = this.props.actions

    const newName = window.prompt('Please enter the name', name)

    if (newName) {
      // call the action to update the data
      updateName(newName)
    }
  }

  // render the component
  render () {
    // the data we need from the imported stores
    const { capitalizedName, currentSlide, currentImage } = this.props

    return (
      <div className='homepage-scene'>
        <Slider />
        <h1>
          Hello, I'm <em onClick={this.updateName}>{capitalizedName}</em> the Kea
        </h1>
        <p>
          You are viewing image #{currentSlide + 1}, taken by <a href={currentImage.url} target='_blank'>{currentImage.author}</a>
        </p>
      </div>
    )
  }
}

// finally, connect the mapping to the scene
export default connectMapping(mapping)(HomepageScene)
```

Logic stores consist of many parts:

They all have a path in the redux tree.

```js
// scenes/homepage/logic.js - all of the code below will be in this one file
class SceneLogic extends Logic {
  // PATH
  path = () => ['scenes', 'homepage', 'index']
```

They have (redux-act) actions. Give them a keyword, a help text and the payload object generator.

```js
  // ACTIONS
  actions = ({ constants }) => ({
    updateName: createAction('change the name of the bird', (name) => ({ name }))
  })
```

They have a *structure*, consisting of `redux` and `reselect` with type declarations and optional persistence. Everything here is a pure function working with immutable data.

```js
  // STRUCTURE
  structure = ({ actions, constants }) => ({
    name: createMapping({
      [actions.updateName]: (state, payload) => {
        return payload.name
      }
    }, 'Chirpy', PropTypes.string)
  })
```

And finally selectors (via [`reselect`](https://github.com/reactjs/reselect)) to transform and cache data:

```js
  // SELECTORS
  selectors = ({ path, structure, constants, selectors, addSelector }) => {
    // define the name of the selector, its PropType and tell it what data you want
    addSelector('capitalizedName', PropTypes.string, [
      selectors.name,
      // otherLogic.selectors.nameFromOtherFile
    ], (name) => {
      // and return the answer
      return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
    })
  }
}
```

Logic stores are exported as singletons from these `logic.js` files:

```js
export default new SceneLogic().init()
```

The logic store can be imported in any component, saga or other logic store as needed.

While logic stores can exist anywhere, it is recommended organise your code like this:

* `scenes` - a scene is a page or a subsystem in your app
* `components` - react components that are shared between scenes
* `utils` - javascript utils shared between scenes

Also, as we strive for simplicity, readability and clarity, we will skip semicolons. They are added/removed as needed in the transpiling/minimising stage, and add no value. Any "I forgot the semicolon" errors you might be worried about will be caught by the linter anyway. (Please install eslint and plugins for your IDE!)

Here's a typical structure:

```
scenes/homepage/
- index.js    # the react component
- logic.js    # actions, reducers, selectors
- saga.js     # saga
- styles.scss # styles for this scene
- scene.js    # one of these per scene

scenes/homepage/slider/
- _assets/    # some images
- index.js    # the react component
- logic.js    # actions, reducers, selectors
- saga.js     # saga
- styles.scss # styles for the slider

scenes/todos/
- index.js    # the react component
- logic.js    # actions, reducers, selectors
- saga.js     # saga
- styles.scss # styles for this scene
- scene.js    # one of these per scene

scenes/todos/todo/
- index.js    # the react component

components/
- header/
  - index.js
  - styles.scss

utils/
- create-uuid.js
- range.js
- delay.js

scenes/
- index.js
- routes.js
- styles.scss

/
- index.html
- index.js
- store.js
```

Each logic store can have a [`saga`](https://github.com/yelouafi/redux-saga):

```js
// scenes/homepage/slider/saga.js
import delay from '~/utils/delay'

import sliderLogic from '~/scenes/homepage/slider/logic'

// we want to call the updateSlide action on the slider's logic store
const actions = selectActionsFromLogic([
  sliderLogic, [
    'updateSlide'
  ]
])

export default function * saga () {
  const { updateSlide } = actions

  while (true) {
    // wait for the updateSlide action to trigger or 5 seconds to pass
    const { change, timeout } = yield race({
      change: take(updateSlide().type),
      timeout: delay(5000)
    })

    // if timed out, advance the slide
    if (timeout) {
      const currentSlide = yield sliderLogic.get('currentSlide')
      yield put(updateSlide(currentSlide + 1))
    }

    // and wait again
  }
}
```

All code is combined into scenes. Scenes are defined in `scene.js` files:

```js
// scenes/homepage/scene.js
import { createScene } from 'kea-logic'

import sceneComponent from '~/scenes/homepage/index'
import sceneLogic from '~/scenes/homepage/logic'
import sceneSaga from '~/scenes/homepage/saga'

import sliderLogic from '~/scenes/homepage/slider/logic'
import sliderSaga from '~/scenes/homepage/slider/saga'

export default createScene({
  name: 'homepage',
  component: sceneComponent,
  logic: [
    sceneLogic,
    sliderLogic
  ],
  sagas: [
    sceneSaga,
    sliderSaga
  ]
})
```

Give `redux-router` a helping hand:

```js
// routes.js
import { combineScenesAndRoutes } from 'kea-logic'

const scenes = {
  homepage: require('bundle?lazy&name=homepage!./homepage/scene.js'),
  todos: require('bundle?lazy&name=todos!./todos/scene.js')
}

const routes = {
  '/': 'homepage',
  '/todos': 'todos',
  '/todos/:visible': 'todos'
}

export default combineScenesAndRoutes(scenes, routes)
```

... and have those scenes lazily loaded when route is accessed.

## Try it out!

Check out the [example](https://github.com/mariusandra/kea-example) by running:

```
npm install kea -g
kea new myproject
cd myproject
npm start
```

Later inside `myproject` just run these to hack away:

```
kea g scene-name                               # new scene
kea g scene-name/component-name                # component under the scene
kea g scene-name/component-name/really-nested  # deeply nested logic
```

## What is `kea`?

Read more here about the quest to find [the smartest way to develop react applications](https://github.com/mariusandra/kea).

## List of public functions:

```js
export { createLogic } from './logic'
export { pathSelector, createSelectors } from './selectors'
export { selectPropsFromLogic, propTypesFromMapping, havePropsChanged } from './props'
export { selectActionsFromLogic, actionMerge } from './actions'
export { createPersistentReducer, createStructureReducer } from './reducer'
export { createCombinedSaga } from './saga'
export { createScene } from './scene'
export { createMapping } from './structure'
export { connectMapping } from './connect'
export { getRoutes, combineScenesAndRoutes } from './routes'
export { NEW_SCENE, createRootSaga, createKeaStore } from './store'
```

More documentation coming soon! Please help if you can!
