import styles from './ConfirmModal.module.css'

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false }) => {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>
                {message && <p className={styles.message}>{message}</p>}
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${danger ? styles.confirmBtnDanger : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal;