import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import Stepper from '../../components/Stepper/Stepper'
import axios from 'axios'
import styles from './OrderConfirm.module.css'

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

const OrderConfirm = () => {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId')
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(!!orderId)// si no hay orderId, ni arrancamos loading
    const [error, setError] = useState(orderId ? null : 'No se encontró el número de orden')

    const buildWhatsAppLink = (order, orderId) => {
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER 
    const itemsList = order.items.map(i => `${i.productName} (${i.color}, talle ${i.size}) x${i.quantity}`).join('\n')

    const message = `Hola! Quiero coordinar mi pedido #${orderId.slice(0, 8)}.
        ${itemsList}

        Total: $${Number(order.total).toLocaleString('es-AR')}
        Tipo de entrega: ${order.shippingType === 'coordinado' ? 'Coordinado' : 'Retiro en local'}`

            return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        }


    useEffect(() => {
        if (!orderId) return // ya se resolvió arriba, el efecto no tiene nada que hacer

        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/order/${orderId}/summary`)
            .then(({ data }) => setOrder(data))
            .catch(() => setError('No pudimos encontrar los datos de tu orden'))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) {
        return <div className={styles.page}><p className={styles.text}>Cargando...</p></div>
    }

    if (error || !order) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Ups</h1>
                    <p className={styles.text}>{error}</p>
                    <button className={styles.btn} onClick={() => navigate('/')}>Volver a la tienda</button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Checkout' },
            ]} />

            <Stepper currentStep={4} />

            <div className={styles.content}>
                <h1 className={styles.title}>¡Gracias por tu compra!</h1>
                <p className={styles.text}>
                    Tu pago fue aprobado y ya estamos preparando tu pedido.
                </p>
                {orderId && <p className={styles.orderId}>Número de orden: {orderId}</p>}

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
                <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Envío</p>
                    <p className={styles.infoValue}>{SHIPPING_LABELS[order.shippingType] || order.shippingType}</p>
                    {order.shippingType === 'correo_argentino' && (
                        <p className={styles.infoValue}>{order.address}, {order.city} ({order.zipCode})</p>
                    )}
                    {order.shippingType === 'coordinado' && (
                        <p className={styles.infoValue}>{order.address}, {order.city}</p>
                    )}
                    {order.shippingType === 'retiro_en_local' && (
                        <p className={styles.infoValue}>Entre Ríos 1529, López, Santa Fe</p> 
                    )}
                </div>

                {(order.shippingType === 'coordinado' || order.shippingType === 'retiro_en_local') && (
                        <a href={buildWhatsAppLink(order, orderId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsappBtn}
                    >
                        Coordinar por WhatsApp
                    </a>
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

                <button className={styles.btn} onClick={() => navigate('/')}>
                    Volver a la tienda
                </button>
            </div>
        </div>
    )
}

export default OrderConfirm