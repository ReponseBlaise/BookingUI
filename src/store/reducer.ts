import type { State, Action } from './types'
import { produce } from 'immer'

export function reducer(state: State, action: Action): State {
  return produce(state, draft => {
    switch (action.type) {
      case 'SET_LISTINGS':
        draft.listings = action.payload
        return

      case 'SET_LOADING':
        draft.loading = action.payload
        return

      case 'SET_FILTER':
        draft.filter = action.payload
        return

      case 'TOGGLE_FAVORITE':
        if (draft.saved.has(action.payload)) {
          draft.saved.delete(action.payload)
        } else {
          draft.saved.add(action.payload)
        }
        return

      case 'RESET':
        draft.filter = ''
        draft.saved = new Set()
        return

      default:
        return
    }
  })
}
