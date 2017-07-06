![Kea Logo](https://kea.rocks/img/logo.png)

A `kea` is two things:

1. An [extremely smart mountain parrot](https://www.youtube.com/results?search_query=kea+parrot) from New Zealand.
2. An equally smart architecture for frontend webapps, built on top of React and Redux.

# What's included?

1. `kea/logic` - Redux Logic Stores. Think of it as an **ES6+ data-import system** built on top of Redux.

2. `kea/saga` - ES6 classes for readable side effects.

3. `kea/scene` - Logic + Sagas = Scenes. Includes routing and code splitting.

4. `kea/cli` - Scaffolding. Easy project and code generation.

# Try it out

Open the [demo app](http://example.kea.rocks/), then [edit it live in Gomix](https://gomix.com/#!/project/kea-example) or [view its source on GitHub](https://github.com/mariusandra/kea-example).

# NEW! v0.19 - INLINE KEA

There is a new feature called "inline kea", which is released with the beta version `0.19-0`.

With it you may add logic to your components by writing it like this:


```jsx
import { kea } from 'kea'

@kea({
  key: (props) => props.id,
  path: (key) => ['scenes', 'homepage', 'slider', key],

  actions: () => ({
    updateSlide: index => ({ index })
  }),

  reducers: ({ actions, key, props }) => ({
    currentSlide: [props.initialSlide || 0, PropTypes.number, {
      [actions.updateSlide]: (state, payload) => payload.key === key ? payload.index % images.length : state
    }]
  }),

  selectors: ({ selectors }) => ({
    currentImage: [
      () => [selectors.currentSlide],
      (currentSlide) => images[currentSlide],
      PropTypes.object
    ]
  })
})
export default class Slider extends Component {
  render () {
    const { currentSlide, currentImage } = this.props
    const { updateSlide } = this.actions

    const title = `Image copyright by ${currentImage.author}`

    return (
      <div className='kea-slider'>
        <img src={currentImage.src} alt={title} title={title} />
        <div className='buttons'>
          {range(images.length).map(i => (
            <span key={i} className={i === currentSlide ? 'selected' : ''} onClick={() => updateSlide(i)} />
          ))}
        </div>
      </div>
    )
  }
}
```

Also add Sagas and they will be started and terminated together with your component! Each instance of the component runs their own sagas!

```jsx
import { kea } from 'kea'

@kea({
  key: (props) => props.id,

  path: (key) => ['scenes', 'homepage', 'slider', key],

  actions: () => ({
    updateSlide: index => ({ index })
  }),

  reducers: ({ actions, key, props }) => ({
    currentSlide: [props.initialSlide || 0, PropTypes.number, {
      [actions.updateSlide]: (state, payload) => payload.key === key ? payload.index % images.length : state
    }]
  }),

  selectors: ({ selectors }) => ({
    currentImage: [
      () => [selectors.currentSlide],
      (currentSlide) => images[currentSlide],
      PropTypes.object
    ]
  }),

  start: function * () {
    const { updateSlide } = this.actions

    console.log('Starting homepage slider saga')
    // console.log(this, this.actions, this.props)

    while (true) {
      const { timeout } = yield race({
        change: take(action => action.type === updateSlide.toString() && action.payload.key === this.key),
        timeout: delay(5000)
      })

      if (timeout) {
        const currentSlide = yield this.get('currentSlide')
        yield put(updateSlide(currentSlide + 1))
      }
    }
  },

  stop: function * () {
    console.log('Stopping homepage slider saga')
  },

  // sagas: [ array of sagas from elsewhere that run with the component ],

  takeEvery: ({ actions, workers }) => ({
    [actions.updateSlide]: workers.updateSlide
  }),

  workers: {
    updateSlide: function * (action) {
      if (action.payload.key === this.key) {
        console.log('slide update triggered', action.payload.key, this.key, this.props.id)
        // console.log(action, this)
      }
    }
  }
})
export default class Slider extends Component {
  render () {
    const { currentSlide, currentImage } = this.props
    const { updateSlide } = this.actions

    const title = `Image copyright by ${currentImage.author}`

    return (
      <div className='kea-slider'>
        <img src={currentImage.src} alt={title} title={title} />
        <div className='buttons'>
          {range(images.length).map(i => (
            <span key={i} className={i === currentSlide ? 'selected' : ''} onClick={() => updateSlide(i)} />
          ))}
        </div>
      </div>
    )
  }
}
```

See [slider/index.js](https://github.com/mariusandra/kea-example/blob/master/app/scenes/homepage/slider/index.js) in the [example](https://github.com/mariusandra/kea-example/) for more!

This feature is still in beta and has a few obvious issues (cache cleanup! performance tuning!), but it works! Stay tuned for more updates and please report any and all bugs you find with it.

All the "old" code works as it should.

# NEW! v0.19 - Connecting to redux

Starting with `0.19` to connect `kea` to your application, all you need to do is to hook up `redux` and `redux-saga` as you normally would, and then just add `keaReducer` and `keaSaga`, like this:

```js
import { keaSaga, keaReducer } from 'kea' // kea line

const reducers = combineReducers({
  routing: routerReducer,
  scenes: keaReducer('scenes') // kea line
})

const sagaMiddleware = createSagaMiddleware()
const finalCreateStore = compose(
  applyMiddleware(sagaMiddleware),
  applyMiddleware(routerMiddleware(browserHistory))
)(createStore)

const store = finalCreateStore(reducers)

sagaMiddleware.run(keaSaga) // kea line
```

# Logic stores

Logic stores consist of actions, reducers and selectors. They include prop types and look like this:

```js
import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class HomepageLogic extends Logic {
  path = () => ['scenes', 'homepage', 'index']

  actions = ({ constants }) => ({
    updateName: (name) => ({ name }),
    increaseAge: (amount = 1) => ({ amount }),
    decreaseAge: (amount = 1) => ({ amount })
  })

  reducers = ({ actions, constants }) => ({
    name: ['Chirpy', PropTypes.string, {
      [actions.updateName]: (state, payload) => payload.name
    }],

    age: [3, PropTypes.number, { persist: true }, { // persist == save in LocalStorage
      [actions.increaseAge]: (state, payload) => state + payload.amount,
      [actions.decreaseAge]: (state, payload) => Math.max(state - payload.amount, 1)
    }]
  })

  selectors = ({ selectors, constants }) => ({
    capitalizedName: [
      () => [selectors.name],
      (name) => name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' '),
      PropTypes.string
    ],

    description: [
      () => [selectors.capitalizedName, selectors.age],
      (capitalizedName, age) => `Hello, I'm ${capitalizedName}, a ${age} years old bird!`,
      PropTypes.string
    ]
  })
}
```

*Note: all of this can be done without `@decorators`. [Here's how](https://github.com/mariusandra/kea/blob/master/docs/no-decorators.md).*

Check out the [TodoMVC logic.js](https://github.com/mariusandra/kea-example/blob/master/app/scenes/todos/logic.js) for a longer example.

Once imported, logic stores expose familiar concepts:

```js
import homepageLogic from '~/scenes/homepage/logic'

// you can start using it in your project right away!
// ... as long as you have set the "path" to where it can be found in your reducer tree
homepageLogic.path === ['scenes', 'homepage', 'index']
homepageLogic.selector === (state) => state.scenes.homepage.index

homepageLogic.actions === { updateName: (name) => { ... }, increaseAge: (amount) => { ... }, ... }
homepageLogic.reducer === function (state, action) { ... }
homepageLogic.selectors === { name: (state) => state.scenes.homepage.index.name, capitalizedName: ... }

// or plug them into other kea components for maximum interoperability
```

# Component

Let's `@connect` to a React component:

```js
import { connect } from 'kea/logic'

import Slider from '~/scenes/homepage/slider'

import sceneLogic from '~/scenes/homepage/logic'
import sliderLogic from '~/scenes/homepage/slider/logic'

@connect({
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
})
export default class HomepageScene extends Component {
  // propTypes are added automatically. Add additional ones when passed manually
  // static propTypes = {}

  updateName = () => {
    const { name } = this.props
    const { updateName } = this.props.actions

    const newName = window.prompt('Please enter the name', name)

    if (newName) {
      updateName(newName) // no need for dispatch
    }
  }

  render () {
    const { capitalizedName, currentSlide, currentImage } = this.props

    return (
      <div className='homepage-scene'>
        <Slider />
        <h1>
          Hello, I am <em onClick={this.updateName}>{capitalizedName}</em> the Kea
        </h1>
        <p>
          You are viewing image #{currentSlide + 1}, taken by <a href={currentImage.url}>{currentImage.author}</a>
        </p>
      </div>
    )
  }
}
```

*Note: all of this can be done without `@decorators`. [Here's how](https://github.com/mariusandra/kea/blob/master/docs/no-decorators.md).*
# Side effects (API calls, etc)

`kea/saga` provides a `Saga` class for beautiful orchestration of side effects via redux-saga.

```js
import Saga from 'kea/saga'

import sceneLogic from '~/scenes/homepage/logic'
import sliderLogic from '~/scenes/homepage/slider/logic'

export default class HomepageSaga extends Saga {
  // pull in actions from logic stores
  actions = () => ([
    sceneLogic, [
      'updateName',
      'increaseAge',
      'decreaseAge'
    ],
    sliderLogic, [
      'updateSlide'
    ]
  ])

  // bind some actions to worker functions
  takeEvery = ({ actions }) => ({
    [actions.updateName]: this.nameLogger,
    [actions.increaseAge]: this.ageLogger,
    [actions.decreaseAge]: this.ageLogger
  })
  // also available: takeLatest

  // main loop of saga
  // - update the slide every 5 sec
  run = function * () {
    // to ease readability we always list the actions we use on top
    const { updateSlide } = this.actions

    while (true) {
      // wait for someone to call the updateSlide action or for 5 seconds to pass
      const { timeout } = yield race({
        change: take(updateSlide),
        timeout: delay(5000)
      })

      // if timed out, advance the slide
      if (timeout) {
        // you can the contents of a logic store instance via "yield logic.get('property')"
        const currentSlide = yield sliderLogic.get('currentSlide')
        // dispatch the updateSlide action
        yield put(updateSlide(currentSlide + 1))
      }

      // re-run loop - wait again for 5 sec
    }
  }

  // clean up if needed
  cancelled = function * () {
    console.log('Closing saga')
  }

  // on every updateName
  nameLogger = function * (action) {
    const { name } = action.payload
    console.log(`The name changed to: ${name}!`)
  }

  // on every increaseAge, decreaseAge
  ageLogger = function * (action) {
    const age = yield sceneLogic.get('age')
    console.log(`The age changed to: ${age}!`)
  }
}
```

Read the documentation for [`redux-saga`](https://github.com/yelouafi/redux-saga) or check out
[another example](https://gist.github.com/mariusandra/e6091b393e153c9edf3ba451a9d91aeb)!

Hook them into `kea/scene` (explained below) or call from your existing code like this:

```js
const homepageSaga = new HomepageSaga().init()

// from your existing saga:
yield call(homepageSaga)
```

# Scenes

You can use all the logic store reducers and sagas individually in your existing application.

If, however, you favor convenience, you may combine them into scenes.

Scenes are defined in `scene.js` files like so:

```js
// scenes/homepage/scene.js
import { createScene } from 'kea/scene'

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

You may then access the combined scene like so:

```js
import homepageScene from '~/scenes/homepage'

homepageScene.saga === function * () { ... }                    // start the scene sagas in parallel
homepageScene.combineReducers() === function (state, action) {} // calls redux's combineReducers
```

or plug it into the kea-logic routing helpers.

# Routing

Give `redux-router` a helping hand:

```js
// routes.js
import { combineScenesAndRoutes } from 'kea/scene'

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

# Code structure

While logic stores can exist anywhere, it is highly recommended to organise your code like this:

* `scenes` - a scene is a page or a subsystem in your app
* `components` - react components that are shared between scenes
* `utils` - javascript utils shared between scenes

Side note: as we strive for simplicity, readability and clarity, we will use [JavaScript Standard Style](http://standardjs.com/rules.html) and skip semicolons. They are added/removed as needed in the transpiling/minimising stage, and add no value. Any "I forgot the semicolon" errors you might be worried about will be caught by the linter anyway. (Please install eslint and plugins for your IDE!)

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

# Scaffolding

Open the [demo app](http://example.kea.rocks/) and [browse its code](https://github.com/mariusandra/kea-example).

To run the same example app on your machine, just type these commands:

```
npm install kea -g
kea new my-project
cd my-project
npm install # or yarn
npm start
```

and open [http://localhost:2000/](http://localhost:2000/).

Later inside `my-project` run these to hack away:

```
kea g scene-name                               # new scene
kea g scene-name/component-name                # component under the scene
kea g scene-name/component-name/really-nested  # deeply nested logic
```

More documentation coming soon! Please help if you can!
