# kea-logic

`kea-logic` lets you create logic stores, and access their contents from React components as props.

Logic stores consist of 1) actions, 2) reducers, 3) selectors and 4) optionally sagas.

Logic stores augment your components, are stored in redux, and are connected via ES6 imports.

If a picture is worth a thousand words, then [live code](https://github.com/mariusandra/kea-example) ([demo](http://example.kea.rocks/)) is worth a million:

```js
// scenes/homepage/index.js - This the root component for the homepage scene

import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { selectPropsFromLogic } from 'kea-logic'

// a helper component
import Slider from './slider'

// logic stores: 1) for this "homepage" scene root component and 2) the slider helper component
import sceneLogic from './logic'
import sliderLogic from './slider/logic'

// we declare that we want to use this logic store action:
const { updateName } = sceneLogic.actions

// the props we need from the imported logic stores
const propSelector = selectPropsFromLogic([
  sceneLogic, [
    'name',
    'capitalizedName'
  ],
  sliderLogic, [
    'currentSlide',
    'currentImage'
  ]
])

// the scene component itself
class HomepageScene extends Component {
  static propTypes = {
    // redux
    dispatch: React.PropTypes.func.isRequired,

    // sceneLogic
    name: React.PropTypes.string.isRequired,
    capitalizedName: React.PropTypes.string.isRequired,

    // sliderLogic
    currentSlide: React.PropTypes.number.isRequired,
    currentImage: React.PropTypes.object.isRequired
  }

  // binding to 'this', hence the fat arrow syntax
  this.updateName = () => {
    const { dispatch, name } = this.props

    const newName = window.prompt('Please enter the name', name)

    if (newName) {
      dispatch(updateName(newName))
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
          Hello, I''m <em onClick={this.updateName}>{capitalizedName}</em> the Kea
        </h1>
        <p>
          You are viewing image #{currentSlide + 1}, taken by <a href={currentImage.url} target='_blank'>{currentImage.author}</a>
        </p>
      </div>
    )
  }
}

// finally, connect the prop selector to the scene via redux
export default connect(propSelector)(HomepageScene)
```

Logic stores consist of a path:

```js
// scenes/homepage/logic.js - all of the code below will be in this one file

// PATH
export const path = ['scenes', 'homepage', 'index']
```

Actions, created via [`redux-act`](https://github.com/pauldijou/redux-act), so you don't need to duplicate constants everywhere:

```js
// ACTIONS
export const actions = {
  updateName: createAction('change the name of the bird', (name) => ({ name }))
}
```

A reducer, also created via [`redux-act`](https://github.com/pauldijou/redux-act). Accepts our action creators directly as keys:

```js
// REDUCER
export const reducer = combineReducers({
  name: createReducer({
    [actions.updateName]: (state, payload) => {
      return payload.name
    }
  }, 'Chirpy') // the default value
})
```

And selectors (via [`reselect`](https://github.com/reactjs/reselect)) to receive, combine and memoize data:

```js
// SELECTORS
export const selectors = createSelectors(path, reducer) // automatically for all redux keys

selectors.capitalizedName = createSelector(             // and a special one to capitalize the name
  selectors.name,
  (name) => {
    return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
  }
)
```

They are merged into a logic store, and exported from `logic.js`:

```js
export default createLogic({
  path,
  actions,
  reducer,
  selectors
})
```

The logic store can be imported in any component, saga or other logic store as needed.

While logic stores can exist anywhere, it has proven useful to organise your code like this:

* `scenes` - a scene is a page or a subsystem in your app
* `components` - react components that are shared between scenes
* `utils` - javascript utils shared between scenes

For example:

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

Each react component or logic store can have a [`saga`](https://github.com/yelouafi/redux-saga):

```js
// scenes/homepage/slider/saga.js

import sliderLogic from './logic'

// we want to use the updateSlide action to manipulate the scenes/homepage/slider/logic.js store
const { updateSlide } = sliderLogic.actions

export default function * saga () {
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

Reducers from logic stores can be added to redux via `combineReducers` like any other redux reducer. Sagas can be started any way you like.

If, however you favour convenience (and programmer happiness), you can combine them all into a scene:

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

Combine all your scenes with routes:

```js
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

... and have those lazily loaded when route is accessed.

## Try it out!

Check out the [example](https://github.com/mariusandra/kea-example) by running:

```
npm install kea -g
kea new myproject
cd myproject
npm start
```

## What is `kea`?

Read more here about the quest to find [the smartest way to develop react applications](https://github.com/mariusandra/kea).

## List of public functions:

* createLogic
* pathSelector
* createSelectors
* createCombinedReducer
* selectPropsFromLogic
* createCombinedSaga
* createScene
* getRoutes
* combineScenesAndRoutes

Proper documentation coming soon! Please help if you can!
