import { createScene } from 'kea/logic'

import sceneComponent from '~/scenes/$$dash-scene$$/index'

import sceneLogic from '~/scenes/$$dash-scene$$/logic'
import sceneSaga from '~/scenes/$$dash-scene$$/saga'

export default createScene({
  name: '$$camelScene$$',
  component: sceneComponent,
  logic: [
    sceneLogic
  ],
  sagas: [
    sceneSaga
  ]
})
