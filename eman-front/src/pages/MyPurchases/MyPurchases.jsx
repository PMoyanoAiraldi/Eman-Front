import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import axiosInstance from '../../api/axiosInstance'
import styles from './MyPurchases.module.css'

const stateLabels = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
}

const MyPurchases = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const user = useSelector(state => state.auth.user)

    useEffect(() => {
        if (!user?.id) return
        axiosInstance.get(`/order/user/${user.id}`)
            .then(res => setOrders(res.data))
            .finally(() => setLoading(false))
    }, [user])

    return (
        <section className={styles.page}>

        <div className={styles.breadcrumbWrapper}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Mis Compras' },
            ]} />
        </div>

            <div className={styles.header}>
                <h1 className={styles.title}>Mis Compras</h1>
                <span className={styles.count}>
                    {orders.length} {orders.length === 1 ? 'compra' : 'compras'}
                </span>
            </div>

            {loading ? (
                <div className={styles.loading}>Cargando...</div>
            ) : orders.length === 0 ? (
                <div className={styles.empty}>Todavía no realizaste ninguna compra.</div>
            ) : (
                <div className={styles.orderList}>
                    {orders.map(order => {
                        const lastPayment = order.payments?.[order.payments.length - 1]
                        return (
                            <Link
                                key={order.id}
                                to={`/mis-compras/${order.id}`}
                                className={styles.orderCard}
                            >
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>
                                        Orden #{order.id.slice(0, 8)}
                                    </span>
                                    <span className={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                    </span>
                                    <span className={`${styles.orderState} ${styles[order.state]}`}>
                                        {stateLabels[order.state] ?? order.state}
                                    </span>
                                </div>

                                <div className={styles.items}>
                                    {order.orderDetail.map((detail, i) => {
                                        const primaryImage = detail.product?.images?.find(img => img.isPrimary)
                                        const fallbackImage = detail.product?.images?.[0]
                                        return (
                                            <div key={i} className={styles.item}>
                                                <img
                                                    src={primaryImage?.url ?? fallbackImage?.url}
                                                    alt={detail.productName}
                                                    className={styles.itemImage}
                                                />
                                                <div className={styles.itemInfo}>
                                                    <p className={styles.itemName}>{detail.productName}</p>
                                                    <p className={styles.itemVariant}>
                                                        {detail.variant?.color?.name} · Talle {detail.variant?.size?.name} · x{detail.quantity}
                                                    </p>
                                                </div>
                                                <span className={styles.itemPrice}>${detail.unitPrice}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className={styles.footer}>
                                    <div className={styles.footerLeft}>
                                        {lastPayment && (
                                            <span className={styles.payment}>
                                                {lastPayment.method}
                                                {lastPayment.installments > 1 && ` · ${lastPayment.installments} cuotas`}
                                            </span>
                                        )}
                                        <span className={styles.shipping}>
                                            {order.shippingType?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span className={styles.total}>Total: ${order.total}</span>
                                    <span className={styles.viewDetail}>Ver detalle →</span>
                                </div>
                            </Link>
                            
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default MyPurchases