export function createEvents (logic, input) {
  if (input.events) {
    const events = typeof input.events === 'function' ? input.events(logic) : input.events

    Object.keys(events).forEach(key => {
      const event = events[key]
      const newEvent = Array.isArray(event) ? () => event.forEach(e => e()) : event

      if (logic.events[key]) {
        const oldEvent = logic.events[key]
        logic.events[key] = () => {
          oldEvent()
          newEvent()
        }
      } else {
        logic.events[key] = newEvent
      }
    })
  }
}
