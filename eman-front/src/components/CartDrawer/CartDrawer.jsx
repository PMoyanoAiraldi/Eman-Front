import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeCart, removeItem, increaseQuantity, decreaseQuantity, selectCartTotal } from '../../redux/cartReducer'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, isOpen } = useSelector(state => state.cart)
    const total = useSelector(selectCartTotal)

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
                        Ver productos
                    </button>
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
                                🗑
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