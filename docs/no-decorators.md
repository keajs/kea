# Using kea without decorators

## Logic stores

Insted of

```js
import Logic, { initLogic } from 'kea/logic'

@initLogic
export default class HomepageLogic extends Logic {
  // ...
}
```

use this

```js
import Logic from 'kea/logic'

export default class HomepageLogic extends Logic {
  // ...
}

export default new HomepageLogic().init()
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
import { propTypesFromMapping, connectMapping } from 'kea/logic'

const mapping = {
  actions: [],
  props: []
}

class HomepageScene extends Component {
  static propTypes = propTypesFromMapping(mapping, { /* extra PropTypes if needed */ })

  render () {
    // ...
  }
}

export default connectMapping(mapping)(HomepageScene)
```
