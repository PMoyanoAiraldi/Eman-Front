import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import OrderDetailCard from '../../components/OrderDetailCard/OrderDetailCard'
import axiosInstance from '../../api/axiosInstance'
import { stateLabels} from '../../constants/orderLabels'
import styles from './OrderDetail.module.css' 


const OrderDetail = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axiosInstance.get(`/order/mine/${orderId}/summary`)
            .then(({ data }) => setOrder(data))
            .catch(() => setError('No pudimos encontrar los datos de esta orden'))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) return <div className={styles.page}><p className={styles.text}>Cargando...</p></div>

    if (error || !order) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Ups</h1>
                    <p className={styles.text}>{error}</p>
                    <button className={styles.btn} onClick={() => navigate('/mis-compras')}>
                        Volver a Mis Compras
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Mis Compras', path: '/mis-compras' },
                { label: `Orden #${orderId.slice(0, 8)}` },
            ]} />

            <div className={styles.content}>
                <h1 className={styles.title}>Detalle de tu pedido</h1>

                <div className={styles.orderMeta}>
                <span className={styles.orderId}>Orden #{orderId.slice(0, 8)} · {new Date(order.createdAt).toLocaleDateString('es-AR')}</span>
                <span className={`${styles.orderState} ${styles[order.state]}`}>
                    {stateLabels[order.state] ?? order.state}
                </span>
                </div>

                <div className={styles.detailCard}>
                <OrderDetailCard order={order} orderId={orderId} showWhatsApp={false} />
                </div>

                <button className={styles.btn} onClick={() => navigate('/mis-compras')}>
                    Volver a Mis Compras
                </button>
            </div>
        </div>
    )
}

export default OrderDetail