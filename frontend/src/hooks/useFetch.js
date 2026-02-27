/**
 * Custom hook for data fetching with loading and error states.
 */
import { useState, useEffect, useCallback } from 'react'

/**
 * Generic async data fetcher hook.
 * @param {Function} fetchFn - The async function that returns an axios response.
 * @param {Array} deps - Dependencies to trigger re-fetch.
 * @param {boolean} immediate - Whether to fetch immediately on mount.
 */
export function useFetch(fetchFn, deps = [], immediate = true) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(immediate)
    const [error, setError] = useState(null)

    const fetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetchFn()
            setData(response.data)
        } catch (err) {
            setError(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }, deps) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (immediate) fetch()
    }, [fetch, immediate])

    return { data, loading, error, refetch: fetch }
}


/**
 * Hook for mutation operations (create, delete, update).
 * @param {Function} mutateFn - The async function to execute.
 */
export function useMutation(mutateFn) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const mutate = useCallback(async (...args) => {
        setLoading(true)
        setError(null)
        try {
            const response = await mutateFn(...args)
            return response.data
        } catch (err) {
            const message = err.message || 'Operation failed'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }, [mutateFn])

    return { mutate, loading, error, clearError: () => setError(null) }
}
