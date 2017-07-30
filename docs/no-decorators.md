# Using kea without decorators

## Components

Instead of this:

```js
import { kea } from 'kea'

@kea({
  actions: () => ({}),
  reducers: () => ({}),
})
export default class HomepageScene extends Component {
  render () {
    // ...
  }
}
```

use this

```js
import { kea } from 'kea'

const keaOptions = {
  actions: () => ({}),
  reducers: () => ({}),
}

class HomepageScene extends Component {
  render () {
    // ...
  }
}

export default kea(keaOptions)(HomepageScene)
```
