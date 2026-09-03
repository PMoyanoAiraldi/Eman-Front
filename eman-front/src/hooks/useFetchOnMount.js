import { useEffect } from 'react'

export function useFetchOnMount(fetchFn) {
    useEffect(() => {
        const controller = new AbortController()

        fetchFn(controller.signal).catch(err => {
            if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                console.error(err)
            }
        })

        return () => controller.abort()
    }, [])
}