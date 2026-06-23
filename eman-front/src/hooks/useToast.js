import { useState, useCallback } from 'react'

export const useToast = () => {
    const [toast, setToast] = useState(null)
    // toast: { message, type: 'success' | 'error' | 'info' }

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type })
    }, [])

    const hideToast = useCallback(() => {
        setToast(null)
    }, [])

    return { toast, showToast, hideToast }
}