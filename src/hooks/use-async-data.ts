'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseAsyncDataOptions<T> {
  fetchFn: () => Promise<T>
  dependencies?: unknown[]
  initialData?: T | null
  enabled?: boolean
}

interface UseAsyncDataReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  setData: (data: T | null) => void
}

export function useAsyncData<T>({
  fetchFn,
  dependencies = [],
  initialData = null,
  enabled = true,
}: UseAsyncDataOptions<T>): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
        console.error('useAsyncData error:', err)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [fetchFn, enabled])

  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, enabled])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch,
    setData,
  }
}

// Convenience hook for Supabase queries
interface UseSupabaseQueryOptions<T> {
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
  dependencies?: unknown[]
  enabled?: boolean
}

export function useSupabaseQuery<T>({
  queryFn,
  dependencies = [],
  enabled = true,
}: UseSupabaseQueryOptions<T>): UseAsyncDataReturn<T> {
  return useAsyncData({
    fetchFn: async () => {
      const { data, error } = await queryFn()
      if (error) throw error
      return data as T
    },
    dependencies,
    enabled,
  })
}
