import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Eye, EyeOff, Star } from 'lucide-react'
import { fetchAllProducts, toggleProductState, updateProduct, updateVariantStock } from '../../../redux/admin/adminProductsReducer'
import styles from './Products.module.css'

const Products = ()=> {
    const dispatch = useDispatch()
    const { products, loading, error } = useSelector(state => state.adminProducts)

    console.log("products", products)

    const [search, setSearch] = useState('')
    const [editingProduct, setEditingProduct] = useState(null)
    const [variantProduct, setVariantProduct] = useState(null)
    const [stockEdits, setStockEdits] = useState({}) // { variantId: nuevoStock }
    const [savingStock, setSavingStock] = useState(false)
    const [stockSuccess, setStockSuccess] = useState(false)
    

    useEffect(() => {
        dispatch(fetchAllProducts())
    }, [dispatch])

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    const handleToggleState = (id, currentState) => {
        dispatch(toggleProductState({ id, state: !currentState }))
    }

    const handleToggleFeatured = (product) => {
        dispatch(updateProduct({
            id: product.id,
            data: { isFeatured: !product.isFeatured }
        }))
    }

    const handleStockChange = (variantId, value) => {
        if (!/^\d*$/.test(value)) return // bloquea para que no escriban letras en el input de stock !/^\d*$/.test(value)
        setStockEdits(prev => ({ ...prev, [variantId]: value })) // guarda los cambios en un objeto 
        setStockSuccess(false)
    }

    const handleSaveStock = async () => {
        setSavingStock(true)
        try {
            await Promise.all( //El Promise.all los manda todos en paralelo en lugar de uno por uno
                Object.entries(stockEdits).map(([id, stock]) => //convierte el objeto en un array de pares [id, stock]
                    dispatch(updateVariantStock({ id, stock: Number(stock) })).unwrap() // unwrap hace que si alguno falla, caiga en el catch.
                )
            )
            setStockEdits({})
            setStockSuccess(true)
            dispatch(fetchAllProducts()) // refresca la tabla
        } catch {
            // el error ya lo maneja el reducer
        } finally {
            setSavingStock(false)
        }
}

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Productos</h1>
                    <p className={styles.subtitle}>{products.length} productos en total</p>
                </div>
                <button className={styles.addBtn}>
                    <Plus size={16} strokeWidth={2} />
                    Nuevo producto
                </button>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    type="text"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading && <p className={styles.loading}>Cargando productos...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Género</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Destacado</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(product => (
                                <tr key={product.id} className={!product.state ? styles.rowInactive : ''}>
                                    <td>
                                        <div className={styles.productCell}>
                                            {product.images?.[0]?.url && (
                                                <img
                                                    src={product.images[0]?.url}
                                                    alt={product.name}
                                                    className={styles.productImg}
                                                />
                                            )}
                                            <span className={styles.productName}>{product.name}</span>
                                        </div>
                                    </td>

                                    <td className={styles.cell}>{product.subcategory?.name || '—'}</td>

                                    <td className={styles.cell}>{product.gender || '—'}</td>

                                    <td className={styles.cell}>
                                        ${Number(product.price).toLocaleString('es-AR')}
                                    </td>
                                    <td className={styles.cell}>
                                        <button className={styles.stockBtn}
                                                onClick={() => setVariantProduct(product)}>
                                            {product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0}
                                        </button>
                                    </td>
                                    <td className={styles.cell}>
                                        <button
                                            className={`${styles.iconBtn} ${product.isFeatured ? styles.featuredActive : ''}`}
                                            onClick={() => handleToggleFeatured(product)}
                                            title={product.isFeatured ? 'Quitar destacado' : 'Marcar destacado'}
                                        >
                                            <Star size={16} strokeWidth={1.5} fill={product.isFeatured ? 'currentColor' : 'none'} />
                                        </button>
                                    </td>
                                    <td className={styles.cell}>
                                        <span className={`${styles.badge} ${product.state ? styles.badgeActive : styles.badgeInactive}`}>
                                            {product.state ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className={styles.cell}>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => setEditingProduct(product)}
                                                title="Editar"
                                            >
                                                <Pencil size={15} strokeWidth={1.5} />
                                            </button>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => handleToggleState(product.id, product.state)}
                                                title={product.state ? 'Desactivar' : 'Activar'}
                                            >
                                                {product.state
                                                    ? <EyeOff size={15} strokeWidth={1.5} />
                                                    : <Eye size={15} strokeWidth={1.5} />
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && !loading && (
                        <p className={styles.empty}>No se encontraron productos</p>
                    )}
                </div>
            )}

            {variantProduct && (
        <div className={styles.modalOverlay} onClick={() => { setVariantProduct(null); setStockEdits({}); setStockSuccess(false) }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{variantProduct.name}</h2>
                    <button className={styles.closeBtn} onClick={() => { setVariantProduct(null); setStockEdits({}); setStockSuccess(false) }}>✕</button>
                </div>
                <p className={styles.modalSub}>Stock por variante</p>
                <table className={styles.variantTable}>
                    <thead>
                        <tr>
                            <th>Color</th>
                            <th>Talle</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variantProduct.variants?.map(v => (
                            <tr key={v.id}>
                                <td>
                                    <div className={styles.colorCell}>
                                        <span
                                            className={styles.colorDot}
                                            style={{ background: v.color?.hex || '#ccc' }}
                                        />
                                        {v.color?.name || '—'}
                                    </div>
                                </td>
                                <td>{v.size?.name || '—'}</td>
                                <td>
                                    {/* <span className={v.stock === 0 ? styles.stockEmpty : styles.stockOk}>
                                        {v.stock}
                                    </span> */}
                                    <input
                                        className={styles.stockInput}
                                        type="text"
                                        value={stockEdits[v.id] !== undefined ? stockEdits[v.id] : v.stock}
                                        onChange={e => handleStockChange(v.id, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.modalFooter}>
                    <div className={styles.modalTotal}>
                        <span>Stock total</span>
                        <span>
                            {variantProduct.variants?.reduce((acc, v) => {
                                const edited = stockEdits[v.id]
                                return acc + (edited !== undefined ? Number(edited) : v.stock)
                            }, 0)}
                        </span>
                    </div>
                    {stockSuccess && <p className={styles.stockSaveSuccess}>Stock actualizado correctamente</p>}
                    <button
                        className={styles.saveStockBtn}
                        onClick={handleSaveStock}
                        disabled={savingStock || Object.keys(stockEdits).length === 0}
                    >
                        {savingStock ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
        )}

        </div>
    )
}

export default Products;