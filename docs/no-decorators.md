# Using kea without decorators

## Logic stores

Instead of

```js
import Logic, { initLogic } from 'kea/logic'

@initLogic
export default class HomepageLogic extends Logic {
  // ...
}
```

use this

```js
import Logic, { initLogic } from 'kea/logic'

class HomepageLogic extends Logic {
  // ...
}

export default initLogic(HomepageLogic)
```

## Components

Instead of this:

```js
import { connect } from 'kea/logic'

@connect({
  actions: [],
  props: []
})
export default class HomepageScene extends Component {
  render () {
    // ...
  }
}
```

use this

```js
import { connect } from 'kea/logic'

const mapping = {
  actions: [],
  props: []
}

class HomepageScene extends Component {
  render () {
    // ...
  }
}

export default connect(mapping)(HomepageScene)
```
