import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Eye } from 'lucide-react'
import { fetchAllOrders, updateOrderState } from '../../../redux/admin/adminOrdersReducer'
import styles from './Orders.module.css'

const STATE_OPTIONS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']

const STATE_LABELS = {
    pendiente:  { label: 'Pendiente',  cls: 'pending' },
    confirmado: { label: 'Confirmado', cls: 'confirmed' },
    enviado:    { label: 'Enviado',    cls: 'shipped' },
    entregado:  { label: 'Entregado',  cls: 'delivered' },
    cancelado:  { label: 'Cancelado',  cls: 'cancelled' },
}

const Orders = () => {
    const dispatch = useDispatch()
    const { orders, loading, error } = useSelector(state => state.adminOrders)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        dispatch(fetchAllOrders())
    }, [dispatch])

    const handleStateChange = (id, state) => {
        dispatch(updateOrderState({ id, state }))
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Órdenes</h1>
                    <p className={styles.subtitle}>{orders.length} órdenes en total</p>
                </div>
            </div>

            {loading && <p className={styles.loading}>Cargando órdenes...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Envío</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const stateInfo = STATE_LABELS[order.state] || { label: order.state, cls: 'pending' }
                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <p className={styles.clientName}>{order.guestName}</p>
                                            <p className={styles.clientEmail}>{order.guestEmail}</p>
                                        </td>
                                        <td className={styles.cell}>
                                            {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className={styles.cell}>
                                            {order.shippingType === 'correo_argentino' ? 'Correo Arg.' :
                                            order.shippingType === 'coordinado' ? 'Coordinado' : 'Retiro'}
                                        </td>
                                        <td className={styles.cell}>
                                            ${Number(order.total).toLocaleString('es-AR')}
                                        </td>
                                        <td className={styles.cell}>
                                            <select
                                                className={`${styles.stateSelect} ${styles[stateInfo.cls]}`}
                                                value={order.state}
                                                onChange={e => handleStateChange(order.id, e.target.value)}
                                            >
                                                {STATE_OPTIONS.map(s => (
                                                    <option key={s} value={s}>
                                                        {STATE_LABELS[s]?.label || s}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={styles.cell}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => setSelectedOrder(order)}
                                                title="Ver detalle"
                                            >
                                                <Eye size={15} strokeWidth={1.5} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {orders.length === 0 && !loading && (
                        <p className={styles.empty}>No hay órdenes todavía</p>
                    )}
                </div>
            )}

            {/* Modal detalle de orden */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Detalle de orden</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>

                        <div className={styles.modalSection}>
                            <p className={styles.modalLabel}>CLIENTE</p>
                            <p className={styles.modalValue}>{selectedOrder.guestName}</p>
                            <p className={styles.modalSub}>{selectedOrder.guestEmail} · {selectedOrder.guestPhone}</p>
                        </div>

                        <div className={styles.modalSection}>
                            <p className={styles.modalLabel}>ENVÍO</p>
                            <p className={styles.modalValue}>{selectedOrder.address}, {selectedOrder.city}</p>
                            <p className={styles.modalSub}>{selectedOrder.shippingType}</p>
                        </div>

                        <div className={styles.modalSection}>
                            <p className={styles.modalLabel}>PRODUCTOS</p>
                            {selectedOrder.orderDetails?.map((detail, i) => (
                                <div key={i} className={styles.detailItem}>
                                    <span>{detail.productName}</span>
                                    <span>x{detail.quantity} · ${Number(detail.unitPrice).toLocaleString('es-AR')}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.modalTotal}>
                            <span>Total</span>
                            <span>${Number(selectedOrder.total).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orders;