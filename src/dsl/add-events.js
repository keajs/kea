import { getContext } from '../context'

export function addEvents (events) {
  const logic = getContext().build.building

  Object.keys(events).forEach(key => {
    if (logic.events[key]) {
      const oldEvent = logic.events[key]
      const newEvent = events[key]
      logic.events[key] = () => {
        oldEvent()
        newEvent()
      }
    } else {
      logic.events[key] = events[key]
    }
  })
}
