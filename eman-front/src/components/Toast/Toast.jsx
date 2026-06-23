import { useEffect } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import styles from './Toast.module.css'

const DURATION = 3500 // ms

const icons = {
    success: <Check size={15} strokeWidth={2.5} />,
    error: <AlertCircle size={15} strokeWidth={2} />,
    info: <AlertCircle size={15} strokeWidth={2} />,
}

export default function Toast({ toast, onHide }) {
    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(onHide, DURATION)
        return () => clearTimeout(timer)
    }, [toast, onHide])

    if (!toast) return null

    return (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            <div className={styles.content}>
                <span className={styles.icon}>{icons[toast.type]}</span>
                <span className={styles.message}>{toast.message}</span>
                <button className={styles.closeBtn} onClick={onHide}>
                    <X size={14} strokeWidth={2} />
                </button>
            </div>
            <div
                className={styles.progress}
                style={{ animationDuration: `${DURATION}ms` }}
            />
        </div>
    )
}