import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connectMapping, propTypesFromMapping } from 'kea/logic'

// utils

// components

// logic
import sceneLogic from '~/scenes/$$dash-scene$$/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = sceneLogic.constants

const mapping = {
  actions: [
    sceneLogic, [
      // 'showAll',
      // 'setVisibilityFilter'
    ]
  ],
  props: [
    sceneLogic, [
      // 'visibilityFilter'
    ]
  ]
}

class $$CapitalScene$$Scene extends Component {
  static propTypes = propTypesFromMapping(mapping)

  render () {
    // const { visibilityFilter } = this.props
    // const { showAll, setVisibilityFilter } = this.props.actions

    return (
      <div className='$$dash-scene$$-scene'>
      </div>
    )
  }
}

export default connectMapping(mapping)($$CapitalScene$$Scene)
