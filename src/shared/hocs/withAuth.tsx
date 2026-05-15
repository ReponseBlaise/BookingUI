import type { ComponentType, JSX } from 'react'
import { Navigate, useInRouterContext } from 'react-router-dom'
import { useAuth } from '../../features/auth'

export function withAuth<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  function AuthenticatedComponent(props: P): JSX.Element {
    const { user } = useAuth()
    const inRouter = useInRouterContext()

    if (!user) {
      if (inRouter) {
        return <Navigate to="/login" replace />
      }
      return <></>
    }

    return <Component {...props} />
  }

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName ?? Component.name ?? 'Component'})`
  return AuthenticatedComponent
}
