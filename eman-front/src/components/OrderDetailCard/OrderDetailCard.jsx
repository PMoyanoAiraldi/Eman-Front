import { FaWhatsapp } from 'react-icons/fa'
import styles from './OrderDetailCard.module.css'

const SHIPPING_LABELS = {
    correo_argentino: 'Correo Argentino',
    coordinado: 'Coordinado',
    retiro_en_local: 'Retiro en local',
}

const PAYMENT_METHOD_LABELS = {
    tarjeta_credito: 'Tarjeta de crédito',
    tarjeta_debito: 'Tarjeta de débito',
    transferencia: 'Transferencia / MP',
}

const buildWhatsAppLink = (order, orderId) => {
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER
    const itemsList = order.items.map(i => `${i.productName} (${i.color}, talle ${i.size}) x${i.quantity}`).join('\n')

    const message = `Hola! Quiero coordinar mi pedido #${orderId.slice(0, 8)}.
        ${itemsList}

        Total: $${Number(order.total).toLocaleString('es-AR')}
        Tipo de entrega: ${order.shippingType === 'coordinado' ? 'Coordinado' : 'Retiro en local'}`

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}


const OrderDetailCard = ({ order, orderId, showWhatsApp = false }) => {
    return (
        <>
            {/* Detalle de productos */}
            <div className={styles.summary}>
                {order.items.map((item, i) => (
                    <div key={i} className={styles.summaryItem}>
                        <img src={item.image} alt={item.productName} className={styles.summaryImg} />
                        <div className={styles.summaryInfo}>
                            <p className={styles.summaryName}>{item.productName}</p>
                            <p className={styles.summaryMeta}>
                                {item.color} · Talle {item.size} · x{item.quantity}
                            </p>
                        </div>
                        <span className={styles.summaryPrice}>
                            ${Number(item.unitPrice * item.quantity).toLocaleString('es-AR')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Envío */}
            {(order.shippingType === 'coordinado' || order.shippingType === 'retiro_en_local') ? (
                <div className={styles.shippingCard}>
                    <p className={styles.infoLabel}>Envío</p>
                    <p className={styles.infoValue}>{SHIPPING_LABELS[order.shippingType]}</p>

                    {order.shippingType === 'coordinado' && (
                        <p className={styles.infoValue}>{order.address}, {order.city}</p>
                    )}
                    {order.shippingType === 'retiro_en_local' && (
                        <p className={styles.infoValue}>Entre Ríos 1529, López, Santa Fe</p>
                    )}

                    <p className={styles.shippingNote}>
                        {order.shippingType === 'coordinado'
                            ? 'Nos vamos a contactar por WhatsApp para coordinar el día y la entrega según tu zona.'
                            : 'Coordiná por WhatsApp el día y horario en que vas a pasar a retirar tu pedido.'}
                    </p>

                    {showWhatsApp && (
                        <a href={buildWhatsAppLink(order, orderId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappBtn}
                        >
                            <FaWhatsapp size={18} className={styles.whatsappIcon} />
                            Coordinar por WhatsApp
                        </a>
                    )}
                </div>
            ) : (
                <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Envío</p>
                    <p className={styles.infoValue}>{SHIPPING_LABELS[order.shippingType] || order.shippingType}</p>
                    {order.shippingType === 'correo_argentino' && (
                        <p className={styles.infoValue}>{order.address}, {order.city} ({order.zipCode})</p>
                    )}
                </div>
            )}

            {/* Medio de pago */}
            {order.payment && (
                <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Pago</p>
                    <p className={styles.infoValue}>
                        {PAYMENT_METHOD_LABELS[order.payment.method] || order.payment.method}
                        {order.payment.installments > 1 && (
                            <> · {order.payment.installments} cuotas de ${Number(order.payment.installmentsAmount).toLocaleString('es-AR')}</>
                        )}
                    </p>
                    {order.payment.installments > 1 && order.total !== order.catalogTotal && (
                        <p className={styles.infoNote}>Incluye interés por financiación</p>
                    )}
                </div>
            )}

            {/* Totales */}
            <div className={styles.totals}>
                <div className={styles.totalRow}>
                    <span>Envío</span>
                    <span>{order.shippingCost === 0 ? 'Gratis' : `$${Number(order.shippingCost).toLocaleString('es-AR')}`}</span>
                </div>
                <hr className={styles.divider} />
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <span>Total</span>
                    <span>${Number(order.total).toLocaleString('es-AR')}</span>
                </div>
            </div>
        </>
    )
}

export default OrderDetailCard