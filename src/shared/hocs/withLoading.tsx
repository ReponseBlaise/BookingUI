import type { ComponentType, JSX } from 'react'
import { Spinner } from '../components/Spinner'

type WithLoadingProps = {
  isLoading: boolean
}

export function withLoading<P extends object>(
  Component: ComponentType<P>,
): ComponentType<P & WithLoadingProps> {
  function WithLoadingComponent({ isLoading, ...props }: P & WithLoadingProps): JSX.Element {
    if (isLoading) {
      return <Spinner />
    }

    return <Component {...(props as P)} />
  }

  WithLoadingComponent.displayName = `withLoading(${Component.displayName ?? Component.name ?? 'Component'})`
  return WithLoadingComponent
}
