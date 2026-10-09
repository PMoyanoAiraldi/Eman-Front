import { useEffect } from 'react'
import styles from './ConfirmModal.module.css'

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, confirmDisabled = false }) => {
    useEffect(() => {
        if (!isOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>
                {message && <p className={styles.message}>{message}</p>}
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${danger ? styles.confirmBtnDanger : ''}`}
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal;