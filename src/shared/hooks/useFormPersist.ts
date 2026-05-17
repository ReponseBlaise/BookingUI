import { useEffect, useRef } from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import toast from 'react-hot-toast'

type UseFormPersistOptions = {
  /** Unique key for localStorage */
  storageKey: string
  /** Debounce time in milliseconds before saving (default: 1000) */
  debounceMs?: number
  /** Whether to show toast notifications (default: false) */
  showNotifications?: boolean
  /** Whether to auto-restore on mount (default: true) */
  autoRestore?: boolean
}

/**
 * Hook to persist form data to localStorage with auto-save and restore functionality.
 * Useful for long forms where users might lose their progress.
 * 
 * @example
 * ```tsx
 * const form = useForm<ListingFormInput>()
 * useFormPersist({ form, storageKey: 'listing-draft' })
 * ```
 */
export function useFormPersist<T extends FieldValues>(
  form: UseFormReturn<T>,
  options: UseFormPersistOptions,
): void {
  const { watch, reset, formState: { isDirty } } = form
  const { storageKey, debounceMs = 1000, showNotifications = false, autoRestore = true } = options
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRestoredRef = useRef(false)

  // Watch all form values for changes
  const allValues = watch()

  // Auto-restore on mount
  useEffect(() => {
    if (!autoRestore || hasRestoredRef.current) return

    try {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const parsed = JSON.parse(savedData) as T
        reset(parsed)
        hasRestoredRef.current = true
        if (showNotifications) {
          toast.success('Draft restored')
        }
      }
    } catch (error) {
      console.warn(`Failed to restore form draft from ${storageKey}:`, error)
    }
  }, [storageKey, reset, autoRestore, showNotifications])

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty) return

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(allValues))
        if (showNotifications) {
          toast.success('Draft saved', { duration: 1500 })
        }
      } catch (error) {
        console.error(`Failed to save form draft to ${storageKey}:`, error)
        if (showNotifications) {
          toast.error('Failed to save draft')
        }
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [allValues, isDirty, storageKey, debounceMs, showNotifications])
}

/**
 * Clear saved form draft from localStorage
 */
export function clearFormDraft(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.warn(`Failed to clear form draft from ${storageKey}:`, error)
  }
}

/**
 * Check if a form draft exists in localStorage
 */
export function hasDraft(storageKey: string): boolean {
  try {
    return Boolean(localStorage.getItem(storageKey))
  } catch (error) {
    return false
  }
}
