import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components

// logic
import sceneLogic from '~/scenes/$$dash-scene$$/logic'

// const { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } = sceneLogic.constants

@connect({
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
})
export default class $$CapitalScene$$Scene extends Component {
  render () {
    // const { visibilityFilter } = this.props
    // const { showAll, setVisibilityFilter } = this.props.actions

    return (
      <div className='$$dash-scene$$-scene'>
      </div>
    )
  }
}
