import { useCallback, useEffect, useRef, useState } from 'react'

type RefreshDetail = {
  scope?: string
}

type QueryOptions<T> = {
  enabled?: boolean
  initialData?: T
  refreshScope?: string
}

type MutationOptions<TData, TError, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
  onError?: (error: TError, variables: TVariables) => void | Promise<void>
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void | Promise<void>
}

const DATA_REFRESH_EVENT = 'bookingui:data-refresh'

function scopesMatch(listenerScope: string | undefined, eventScope: string | undefined): boolean {
  if (!listenerScope || listenerScope === '*') return true
  if (!eventScope || eventScope === '*') return true
  return listenerScope === eventScope
}

export function refreshAppData(scope?: string): void {
  window.dispatchEvent(new CustomEvent<RefreshDetail>(DATA_REFRESH_EVENT, { detail: { scope } }))
}

export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  options: QueryOptions<T> = {},
) {
  const { enabled = true, initialData, refreshScope } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(Boolean(enabled))
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)
  const hasDataRef = useRef(initialData !== undefined)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const run = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false)
      setIsFetching(false)
      return undefined
    }

    setIsLoading(current => (!hasDataRef.current ? true : current))
    setIsFetching(true)
    setIsError(false)
    setError(null)

    try {
      const nextData = await fetcherRef.current()
      if (!mountedRef.current) return nextData
      setData(nextData)
      hasDataRef.current = true
      return nextData
    } catch (caughtError) {
      if (!mountedRef.current) return undefined
      const nextError = caughtError instanceof Error ? caughtError : new Error('Request failed')
      setIsError(true)
      setError(nextError)
      return undefined
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        setIsFetching(false)
      }
    }
  }, [enabled])

  useEffect(() => {
    mountedRef.current = true
    void run()

    const onRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<RefreshDetail>
      if (scopesMatch(refreshScope, customEvent.detail?.scope)) {
        void run()
      }
    }

    window.addEventListener(DATA_REFRESH_EVENT, onRefresh)
    return () => {
      mountedRef.current = false
      window.removeEventListener(DATA_REFRESH_EVENT, onRefresh)
    }
  }, [run, refreshScope])

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: run,
  }
}

export function useApiMutation<TData, TVariables, TError = Error>(
  action: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TError, TVariables> = {},
) {
  const { onSuccess, onError, onSettled } = options
  const [data, setData] = useState<TData | undefined>(undefined)
  const [error, setError] = useState<TError | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutateAsync = useCallback(async (variables: TVariables) => {
    setIsPending(true)
    setIsSuccess(false)
    setError(null)

    try {
      const nextData = await action(variables)
      setData(nextData)
      setIsSuccess(true)
      await onSuccess?.(nextData, variables)
      await onSettled?.(nextData, null, variables)
      return nextData
    } catch (caughtError) {
      const nextError = caughtError as TError
      setError(nextError)
      await onError?.(nextError, variables)
      await onSettled?.(undefined, nextError, variables)
      throw caughtError
    } finally {
      setIsPending(false)
    }
  }, [action, onError, onSettled, onSuccess])

  const mutate = useCallback((variables?: TVariables) => {
    void mutateAsync(variables as TVariables).catch(() => undefined)
  }, [mutateAsync])

  const reset = useCallback(() => {
    setData(undefined)
    setError(null)
    setIsPending(false)
    setIsSuccess(false)
  }, [])

  return {
    data,
    error,
    isPending,
    isSuccess,
    isError: error !== null,
    mutate,
    mutateAsync,
    reset,
  }
}
