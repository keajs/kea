import { Logic, LogicBuilder, LogicEventType, PartialRecord } from '../../types'

export function events<L extends Logic = Logic>(
  input:
    | PartialRecord<LogicEventType, (() => void) | (() => void)[]>
    | ((logic: L) => PartialRecord<LogicEventType, (() => void) | (() => void)[]>),
): LogicBuilder<L> {
  return (logic) => {
    const events = typeof input === 'function' ? input(logic) : input

    for (const key of Object.keys(events) as LogicEventType[]) {
      const event = events[key]
      const newEvent = Array.isArray(event) ? () => event.forEach((e) => e()) : event

      if (logic.events[key]) {
        const oldEvent = logic.events[key]
        logic.events[key] = () => {
          oldEvent && oldEvent()
          newEvent && newEvent()
        }
      } else if (newEvent) {
        logic.events[key] = newEvent
      }
    }
  }
}

export function afterMount<L extends Logic = Logic>(input: (logic: L) => void): LogicBuilder<L> {
  return events((logic) => ({ afterMount: () => input(logic) }))
}

export function beforeUnmount<L extends Logic = Logic>(input: (logic: L) => void): LogicBuilder<L> {
  return events((logic) => ({ beforeUnmount: () => input(logic) }))
}
