import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { reducer } from './reducer'
import type { State, Action } from './types'

const initialState: State = {
  listings: [],
  loading: false,
  filter: '',
  saved: new Set(),
}

type StoreContextValue = {
  state: State
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
