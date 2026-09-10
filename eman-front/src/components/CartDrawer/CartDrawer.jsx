import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { closeCart, removeItem, increaseQuantity, decreaseQuantity, selectCartTotal, updateItemStock } from '../../redux/slices/cartReducer'
import axiosInstance from '../../api/axiosInstance'
import styles from './CartDrawer.module.css'
import { Trash2 } from 'lucide-react'

export default function CartDrawer() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, isOpen } = useSelector(state => state.cart)
    const total = useSelector(selectCartTotal)

        useEffect(() => {
        if (!isOpen || items.length === 0) return //solo corre cuando isOpen =  true

        const revalidarStock = async () => {
            // Agrupamos por producto para no pedir el mismo endpoint varias veces
            const productIds = [...new Set(items.map(i => i.id))]

            for (const productId of productIds) {
                try {
                    const res = await axiosInstance.get(`/product_variants/${productId}`)
                    const variantesDelProducto = res.data

                    const itemsDeEseProducto = items.filter(i => i.id === productId)
                    for (const item of itemsDeEseProducto) {
                        const variantActual = variantesDelProducto.find(v => v.id === item.variantId)
                        if (variantActual) {
                            dispatch(updateItemStock({ variantId: item.variantId, stock: variantActual.stock }))
                        }
                    }
                } catch (error) {
                    console.error(`No se pudo revalidar stock del producto ${productId}`, error)
                }
            }
        }

        revalidarStock()
    }, [isOpen])

    const handleCheckout = () => {
        dispatch(closeCart())
        navigate('/checkout')
    }

    return (
        <>
        <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} onClick={() => dispatch(closeCart())} />

        <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
            
            <div className={styles.header}>
                <span className={styles.title}>Tu carrito ({items.length})</span>
                <button onClick={() => dispatch(closeCart())} aria-label="Cerrar carrito" className={styles.closeBtn}>✕</button>
            </div>

            {items.length === 0 ? (
                <div className={styles.empty}>
                    <p>Tu carrito está vacío</p>
                    <button className={styles.keepShoppingBtn} onClick={() => dispatch(closeCart())}>
                        Seguir comprando
                    </button>

                    <div className={styles.categoryLinks}>
                        <span className={styles.categoryLabel}>¿Qué estás buscando?</span>
                        <div className={styles.categoryButtons}>
                            <Link to="/mujer" onClick={() => dispatch(closeCart())}>Mujer</Link>
                            <Link to="/hombre" onClick={() => dispatch(closeCart())}>Hombre</Link>
                            <Link to="/deportivo" onClick={() => dispatch(closeCart())}>Deportivo</Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                <div className={styles.items}>
                    {items.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color?.id}`} className={styles.item}>
                            <div className={styles.itemImage}>
                                {item.image
                                    ? <img src={item.image} alt={item.name} />
                                    : <div className={styles.imagePlaceholder} />
                                }
                            </div>
                            <div className={styles.itemInfo}>
                                <p className={styles.itemName}>{item.name}</p>
                                <p className={styles.itemMeta}>{item.color?.name} · Talle {item.size}</p>
                                <div className={styles.itemBottom}>
                                    <div className={styles.qty}>
                                        <button onClick={() => dispatch(decreaseQuantity({ id: item.id, size: item.size, color: item.color }))}>−</button>
                                        <span>{item.quantity}</span>
                                        <button className={styles.qtyBtn} onClick={() => dispatch(increaseQuantity({ id: item.id, size: item.size, color: item.color }))}
                                        disabled={item.quantity >= item.stock}
                                        >+</button>
                                    </div>
                                    <span className={styles.itemPrice}>
                                        ${Number(item.price * item.quantity).toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>
                            <button
                                className={styles.removeBtn}
                                onClick={() => dispatch(removeItem({ id: item.id, size: item.size, color: item.color }))}
                                aria-label="Eliminar producto"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total</span>
                        <span className={styles.totalAmount}>${Number(total).toLocaleString('es-AR')}</span>
                    </div>
                    <button className={styles.checkoutBtn} onClick={handleCheckout}>Finalizar compra</button>
                    <button className={styles.keepShoppingBtn} onClick={() => dispatch(closeCart())}>Seguir comprando</button>
                </div>
                </>
            )}
        </aside>
        </>
    )
}