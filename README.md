![Kea Logo](https://kea.rocks/img/logo.png)

A `kea` is two things:

1. An [extremely smart mountain parrot](https://www.youtube.com/results?search_query=kea+parrot) from New Zealand.
2. An equally smart architecture for frontend webapps, built on top of React and Redux.

# Try it out

Open the [documentation](https://kea.js.org/) (AKA demo app) and [view its source on GitHub](https://github.com/mariusandra/kea-example).

In the documentation you will find [**several examples with source**](https://kea.js.org/). Check it out!

No, really, [check out the docs](https://kea.js.org/)!

# The basics

You create and connect kea **logic stores** to your components like this:

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

Kea logic stores also supports Sagas. They will be started and terminated together with your component! Each instance of your component runs its own sagas!

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

  // Also implemented:
  // takeLatest: () => ({}),
  // sagas: [ array of sagas from elsewhere that run with the component ],
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

When the logic grows too big, you may extract it from your components and give it a new home in `logic.js` files.

```jsx
// logic.js
export default kea({
  path: () => ['scenes', 'homepage', 'index'],
  actions: ({ constants }) => ({
    updateName: name => ({ name })
  })
  // ...
})
```

```jsx
// index.js
import sceneLogic from './logic'

@sceneLogic
export default class HomepageScene extends Component {
  render () {
    const { name } = this.props
    const { updateName } = this.actions

    // ...
  }
}
```

If you only wish to import some properties and actions from your logic stores, use the `@connect` decorator or add `connect: { props: [], actions: [] }` inside `@kea({})`, like so:

```jsx
// index.js
import sceneLogic from './logic'
import sceneSaga from './saga'

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
    ]
  ],
  sagas: [
    sceneSaga
  ]
})
export default class HomepageScene extends Component {
  render () {
    const { name } = this.props
    const { updateName } = this.actions

    // ...
  }
}
```

# Connecting to your app

Starting with `0.19`, all you need to do is to hook up `redux` and `redux-saga` as you normally would, and then just add `keaReducer` and `keaSaga`, like this:

```js
import { keaSaga, keaReducer } from 'kea' // add this

const reducers = combineReducers({
  scenes: keaReducer('scenes'), // add this
  // other reducers
  // e.g. routing: routerReducer,
})

const sagaMiddleware = createSagaMiddleware()
const finalCreateStore = compose(
  applyMiddleware(sagaMiddleware),
  // other middleware
  // e.g. applyMiddleware(routerMiddleware(browserHistory))
)(createStore)

const store = finalCreateStore(reducers)

sagaMiddleware.run(keaSaga) // add this
```

# Singleton and dynamic logic stores

If you specify the `key` key in `kea({})`, kea will create a dynamic logic store. Each component you connect it to, will have its own actions and reducers.

Omitting this `key` key will create singletons. You can then export these singletons and connect to them as described above.

# Redux all the way!

When you run kea({}), you get in return an object that exposes all the standard redux constructs.

```js
// homepage/logic.js
export default kea({ ... })

// homepage/index.js
import homepageLogic from '~/scenes/homepage/logic'

homepageLogic.path === ['scenes', 'homepage', 'index']
homepageLogic.selector === (state) => state.scenes.homepage.index

homepageLogic.actions === { updateName: (name) => { ... }, increaseAge: (amount) => { ... }, ... }
homepageLogic.reducer === function (state, action) { ... }
homepageLogic.selectors === { name: (state) => state.scenes.homepage.index.name, capitalizedName: ... }

homepageLogic.saga === function * () { ... }
```

# Sagas

You may also create sagas and connect other actions using `kea({})`:

```js
import { kea } from 'kea'

import sceneLogic from '~/scenes/homepage/logic'
import sliderLogic from '~/scenes/homepage/slider/logic'

export default kea({
  // pull in actions from logic stores
  actions: () => ([
    sceneLogic, [
      'updateName',
      'increaseAge',
      'decreaseAge'
    ],
    sliderLogic, [
      'updateSlide'
    ]
  ]),

  // bind some actions to worker functions
  takeEvery: ({ actions, workers }) => ({
    [actions.updateName]: workers.nameLogger,
    [actions.increaseAge]: workers.ageLogger,
    [actions.decreaseAge]: workers.ageLogger
  }),
  // also available: takeLatest

  // main loop of saga
  // - update the slide every 5 sec
  start: function * () {
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
  },

  // clean up if needed
  stop: function * () {
    console.log('Closing saga')
  },

  workers: {
    // on every updateName
    nameLogger: function * (action) {
      const { name } = action.payload
      console.log(`The name changed to: ${name}!`)
    },

    // on every increaseAge, decreaseAge
    ageLogger: function * (action) {
      const age = yield sceneLogic.get('age')
      console.log(`The age changed to: ${age}!`)
    }
  }
})
```

Read the documentation for [`redux-saga`](https://github.com/yelouafi/redux-saga)/


# Scenes

You can use all of the above individually in your existing application.

If you wish, you may combine them into scenes.

Scenes are defined in `scene.js` files like so:

```js
// scenes/homepage/scene.js
import { createScene } from 'kea/scene'

import sceneComponent from '~/scenes/homepage/index'
import sceneSaga from '~/scenes/homepage/saga'

import sliderSaga from '~/scenes/homepage/slider/saga'

export default createScene({
  name: 'homepage',
  component: sceneComponent,
  sagas: [
    sceneSaga,
    sliderSaga
  ]
})
```

You may then access the combined scene like so:

```js
import homepageScene from '~/scenes/homepage'

homepageScene.saga === function * () { ... }  // start all the scene sagas in parallel
```

or plug it into the kea routing helpers.

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

Open the [docs](http://kea.js.org/) and [browse its code](https://github.com/mariusandra/kea-example).

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
