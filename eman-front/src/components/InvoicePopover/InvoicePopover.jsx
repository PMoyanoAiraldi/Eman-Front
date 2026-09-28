import { useState, useRef } from 'react'
import { Check, Clock, FileText, Upload } from 'lucide-react'
import styles from './InvoicePopover.module.css'

const INVOICE_LABELS = {
    pendiente: { label: 'Pendiente', icon: Clock },
    lista:     { label: 'Lista, sin enviar', icon: FileText },
    enviada:   { label: 'Enviada', icon: Check },
}

const InvoicePopover = ({ order, onUpload, onRequestSend, uploading, sending }) => {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const btnRef = useRef(null)
    const fileInputRef = useRef(null)

    const info = INVOICE_LABELS[order.invoiceStatus] || INVOICE_LABELS.pendiente
    const Icon = info.icon

    const toggleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPosition({ top: rect.bottom + 4, left: rect.left })
        }
        setOpen(o => !o)
    }

    const colorClass =
        order.invoiceStatus === 'enviada' ? styles.invoiceIconSent :
        order.invoiceStatus === 'lista'   ? styles.invoiceIconReady :
        styles.invoiceIconPending

    return (
        <span className={styles.filterWrapper}>
            <button
                ref={btnRef}
                type="button"
                className={`${styles.iconBtn} ${colorClass}`}
                onClick={toggleOpen}
                title={`Factura: ${info.label}`}
            >
                <Icon size={17} strokeWidth={1.8} />
            </button>

            {open && (
                <>
                    <div className={styles.filterBackdrop} onClick={() => setOpen(false)} />
                    <div
                        className={styles.invoicePopover}
                        style={{ position: 'fixed', top: position.top, left: position.left }}
                    >
                        <p className={styles.invoicePopoverStatus}>{info.label}</p>

                        {order.invoiceUrl && (
                            
                        <a href={order.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.invoiceLink}
                                onClick={() => setOpen(false)}
                            >
                                Ver archivo actual
                            </a>
                        )}

                        <div className={styles.invoicePopoverActions}>
                            <label className={styles.uploadInvoiceBtnSmall}>
                                <Upload size={13} />
                                {uploading ? 'Subiendo...' : order.invoiceStatus === 'enviada' ? 'Subir NC' : 'Subir'}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                    onChange={e => {
                                        onUpload(order.id, e.target.files[0])
                                        e.target.value = null // permite volver a seleccionar el mismo archivo después
                                    }}
                                />
                            </label>

                            {order.invoiceUrl && order.invoiceStatus !== 'enviada' && (
                                <button
                                    type="button"
                                    className={styles.sendInvoiceBtnSmall}
                                    disabled={sending}
                                    onClick={() => {
                                        onRequestSend(order.id)
                                    }}
                                >
                                    {sending ? 'Enviando...' : 'Enviar ahora'}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </span>
    )
}

export default InvoicePopover;