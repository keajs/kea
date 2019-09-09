export function createEvents (logic, input) {
  if (input.events) {
    const builtEvents = input.events(logic)

    Object.keys(builtEvents).forEach(key => {
      if (logic.events[key]) {
        const oldEvent = logic.events[key]
        const newEvent = builtEvents[key]
        logic.events[key] = () => {
          oldEvent()
          newEvent()
        }
      } else {
        logic.events[key] = builtEvents[key]
      }
    })
  }
}
