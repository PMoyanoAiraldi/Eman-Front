import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, Package, PackageCheck } from 'lucide-react'
import { fetchAllOrders, updateOrderState } from '../../../redux/admin/adminOrdersReducer'
import axiosInstance from '../../../api/axiosInstance'
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal'
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
    const [generatingLabelId, setGeneratingLabelId] = useState(false)
    const [labelError, setLabelError] = useState(null)
    const [orderToConfirm, setOrderToConfirm] = useState(null)

    // Estado pendiente para el pedido de tracking
    const [trackingRequest, setTrackingRequest] = useState(null) // { orderId, pendingState }
    const [trackingInput, setTrackingInput] = useState('')

    useEffect(() => {
        dispatch(fetchAllOrders())
    }, [dispatch])

    const handleStateChange = (order, newState) => {
        // Solo pedimos tracking si pasa a "enviado" y es Correo Argentino
        if (newState === 'enviado' && order.shippingType === 'correo_argentino' && !order.trackingNumber) {
            setTrackingRequest({ orderId: order.id, pendingState: newState })
            setTrackingInput('')
            return
        }
        dispatch(updateOrderState({ id: order.id, state: newState }))
    }

    const confirmTrackingSubmit = () => {
        if (!trackingRequest) return
        dispatch(updateOrderState({
            id: trackingRequest.orderId,
            state: trackingRequest.pendingState,
            trackingNumber: trackingInput.trim() || undefined,
        }))
        setTrackingRequest(null)
        setTrackingInput('')
    }

    const requestGenerateLabel = (order) => {
        setOrderToConfirm(order)
    }

    const confirmGenerateLabel = async () => {
        const order = orderToConfirm
        setOrderToConfirm(null)
        if (!order) return

        setGeneratingLabelId(order.id)
        setLabelError(null)
        try {
            const { data } = await axiosInstance.post(`/order/${order.id}/shipping-label`)
            if (selectedOrder?.id === order.id) setSelectedOrder(data)
            dispatch(fetchAllOrders())
        } catch (err) {
            setLabelError(err.response?.data?.message || 'Error al generar la etiqueta')
        } finally {
            setGeneratingLabelId(null)
        }
    }

    const addressLine = (order) => {
        if (order.deliveryType === 'sucursal') {
            return `${order.agencyName} — ${order.agencyAddress}, ${order.agencyCity}`
        }
        return `${order.streetName} ${order.streetNumber}${order.floor ? ` piso ${order.floor}` : ''}${order.apartment ? ` depto ${order.apartment}` : ''}, ${order.city}`
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
            {labelError && <p className={styles.error}>{labelError}</p>}

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
                                const isCorreoArgentino = order.shippingType === 'correo_argentino'
                                const isGenerated = !!order.shippingImportedAt
                                const isGenerating = generatingLabelId === order.id

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
                                            {isCorreoArgentino && (
                                                isGenerated ? (
                                                    <button
                                                        className={styles.iconBtn}
                                                        title="Etiqueta ya generada en MiCorreo"
                                                        style={{ color: '#2f9e44', cursor: 'default' }}
                                                        disabled
                                                    >
                                                        <PackageCheck size={15} strokeWidth={1.5} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={styles.iconBtn}
                                                        title="Generar etiqueta"
                                                        onClick={() => requestGenerateLabel(order)}
                                                        disabled={isGenerating}
                                                    >
                                                        <Package size={15} strokeWidth={1.5} />
                                                    </button>
                                                )
                                            )}
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

            <ConfirmModal
                isOpen={!!orderToConfirm}
                title="Generar etiqueta en MiCorreo"
                message={
                    orderToConfirm
                        ? `Se va a importar este envío a MiCorreo a nombre de ${orderToConfirm.guestName} (${orderToConfirm.guestEmail} · ${orderToConfirm.guestPhone}), con destino: ${addressLine(orderToConfirm)}. Esta acción no se puede deshacer desde la app.`
                        : ''
                }
                onConfirm={confirmGenerateLabel}
                onCancel={() => setOrderToConfirm(null)}
                confirmLabel="Generar etiqueta"
                cancelLabel="Cancelar"
                danger
            />

            <ConfirmModal
                isOpen={!!trackingRequest}
                title="Marcar como enviado"
                message={
                    <>
                        <p>Pegá el número de seguimiento que te dio MiCorreo al pagar el envío. Se va a incluir en el email que recibe el cliente.</p>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Ej: 000500076393019A3G0C701"
                            value={trackingInput}
                            onChange={e => setTrackingInput(e.target.value)}
                            autoFocus
                        />
                    </>
                }
                onConfirm={confirmTrackingSubmit}
                onCancel={() => setTrackingRequest(null)}
                confirmLabel="Confirmar envío"
                cancelLabel="Cancelar"
                confirmDisabled={!trackingInput.trim()}
            />
        </div>
    )
}

export default Orders;