import React from 'react'
import { Provider as ReactReduxProvider } from 'react-redux'
import { getContext } from '../context'

export function Provider({ children }: { children: React.ReactNode }): JSX.Element {
  return <ReactReduxProvider store={getContext().store}>{children}</ReactReduxProvider>
}
