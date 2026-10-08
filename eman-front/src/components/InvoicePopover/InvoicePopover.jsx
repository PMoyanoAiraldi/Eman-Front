import { useState, useRef, useEffect } from 'react'
import { Check, Clock, FileText, Upload } from 'lucide-react'
import styles from './InvoicePopover.module.css'

const INVOICE_LABELS = {
    pendiente: { label: 'Pendiente', icon: Clock },
    lista:     { label: 'Lista, sin enviar', icon: FileText },
    enviada:   { label: 'Enviada', icon: Check },
}

const POPOVER_WIDTH = 220  // tiene que coincidir con el width de .invoicePopover en el CSS
const POPOVER_HEIGHT = 160 // estimado: solo sirve para decidir si abre hacia arriba
const MARGIN = 8

const InvoicePopover = ({ order, onUpload, onRequestSend, uploading, sending }) => {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0, above: false  })
    const btnRef = useRef(null)
    const fileInputRef = useRef(null)

    const info = INVOICE_LABELS[order.invoiceStatus] || INVOICE_LABELS.pendiente
    const Icon = info.icon

    const toggleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            // Nunca más allá de los bordes de la pantalla
            const left = Math.max(MARGIN, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - MARGIN))
            // Si abajo no hay lugar, abre hacia arriba del botón
            const above = rect.bottom + 4 + POPOVER_HEIGHT > window.innerHeight
            setPosition({ top: above ? rect.top - 4 : rect.bottom + 4, left, above })
        }
        setOpen(o => !o)
    }

     // El popover es fijo: si se scrollea la página (o la tabla), se cierra en vez de quedar flotando
    // lejos de su botón. Escape también lo cierra.
    useEffect(() => {
        if (!open) return
        const close = () => setOpen(false)
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
        window.addEventListener('scroll', close, true) // true: también captura el scroll de contenedores internos
        document.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('scroll', close, true)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

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
                aria-label={`Factura: ${info.label}`}
                aria-expanded={open}
            >
                <Icon size={17} strokeWidth={1.8} />
            </button>

            {open && (
                <>
                    <div className={styles.filterBackdrop} onClick={() => setOpen(false)} />
                    <div
                        className={styles.invoicePopover}
                        style={{ 
                            top: position.top, 
                            left: position.left, 
                            transform: position.above ? 'translateY(-100%)' : undefined,
                        }}
                    >
                        <p className={styles.invoicePopoverStatus}>{info.label}</p>

                        {order.invoiceUrl && (
                            
                        <a 
                            href={order.invoiceUrl}
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