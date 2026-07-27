import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import Stepper from '../../components/Stepper/Stepper'
import OrderDetailCard from '../../components/OrderDetailCard/OrderDetailCard'
import axios from 'axios'
import styles from './OrderConfirm.module.css'


const OrderConfirm = () => {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId')
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(!!orderId)// si no hay orderId, ni arrancamos loading
    const [error, setError] = useState(orderId ? null : 'No se encontró el número de orden')

    useEffect(() => {
        if (!orderId) return 

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

                <OrderDetailCard order={order} orderId={orderId} showWhatsApp={true} />

                <button className={styles.btn} onClick={() => navigate('/')}>
                    Volver a la tienda
                </button>
            </div>
        </div>
    )
}

export default OrderConfirm