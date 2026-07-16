import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Eye, EyeOff, Star, Upload, Trash2, ChevronDown } from 'lucide-react'
import { fetchAllProducts, toggleProductState, updateProduct, updateVariantStock, publishProduct, deleteDraftProduct } from '../../../redux/admin/adminProductsReducer'
import { useToast } from '../../../hooks/useToast'
import { getMissingFields } from '../../../utils/productValidation'
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal'
import Toast from '../../../components/Toast/Toast'
import styles from './Products.module.css'
import { useNavigate } from 'react-router-dom'

const Products = ()=> {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { products, loading, error } = useSelector(state => state.adminProducts)

    console.log("products", products)

    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [genderFilter, setGenderFilter] = useState('')
    const [stateFilter, setStateFilter] = useState('')
    const [variantProduct, setVariantProduct] = useState(null)
    const [stockEdits, setStockEdits] = useState({}) // { variantId: nuevoStock }
    const [savingStock, setSavingStock] = useState(false)
    const { toast, showToast, hideToast } = useToast()
    
    
    const FEATURED_LIMIT = 4

    useEffect(() => {
        dispatch(fetchAllProducts())
    }, [dispatch])

    const categoryOptions = [...new Set(
        products.map(p => p.subcategory?.name).filter(Boolean)
        )]

    const genderOptions = [...new Set(
        products.map(p => p.gender).filter(Boolean)
    )]

    const filtered = products.filter(p =>{
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !categoryFilter || p.subcategory?.name === categoryFilter
        const matchesGender = !genderFilter || p.gender === genderFilter
        const matchesState =
            !stateFilter ||
            (stateFilter === 'active' && p.state) ||
            (stateFilter === 'inactive' && !p.state)

        return matchesSearch && matchesCategory && matchesGender && matchesState
})

    const handleToggleState = (id, currentState) => {
        dispatch(toggleProductState({ id, state: !currentState }))
    }

    const handleToggleFeatured = (product) => {
        // Si ya está destacado, siempre se puede destildar sin restricción
        if (product.isFeatured) {
        dispatch(updateProduct({
            id: product.id,
            data: { isFeatured: false }
        }))
        return
    }

        // Si se quiere marcar como destacado, chequeamos el límite
        const featuredCount = products.filter(p => p.isFeatured && p.state).length

        if (featuredCount >= FEATURED_LIMIT) {
            showToast(`Ya tenés ${FEATURED_LIMIT} productos destacados. Destildá uno para agregar otro.`, 'error')
            return
        }

        dispatch(updateProduct({
            id: product.id,
            data: { isFeatured: true }
        }))
    }

    const handleStockChange = (variantId, value) => {
        if (!/^\d*$/.test(value)) return // bloquea para que no escriban letras en el input de stock !/^\d*$/.test(value)
        setStockEdits(prev => ({ ...prev, [variantId]: value })) // guarda los cambios en un objeto 
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
            setVariantProduct(null) // cierra el modal
            dispatch(fetchAllProducts()) // refresca la tabla
            showToast('Stock actualizado correctamente') // toast de éxito
        } catch {
            showToast('Error al actualizar el stock', 'error') // toast de error
        } finally {
            setSavingStock(false)
        }
}


const handlePublish = async (product) => {
    const missing = getMissingFields(product)
    if (missing.length > 0) {
        showToast(`Falta: ${missing.join(', ')}`, 'error')
        return
    }
    try {
        await dispatch(publishProduct(product.id)).unwrap()
        showToast('Producto publicado correctamente')
        dispatch(fetchAllProducts())
    } catch (err) {
        showToast(err?.message || 'Faltan datos para publicar', 'error')
    }
}

    const [productToDelete, setProductToDelete] = useState(null)

    const handleDeleteDraft = (id) => {
        setProductToDelete(id)
    }

    const confirmDeleteDraft = async () => {
        const id = productToDelete
        setProductToDelete(null)
        try {
            await dispatch(deleteDraftProduct(id)).unwrap()
            showToast('Borrador eliminado')
            dispatch(fetchAllProducts())
        } catch (err) {
            showToast(err?.message || 'Error al eliminar', 'error')
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Productos</h1>
                    <p className={styles.subtitle}>{products.length} productos en total</p>
                </div>
                <button className={styles.addBtn} onClick={() => navigate('/admin/products/new')}>
                    <Plus size={16} strokeWidth={2} />
                    Nuevo producto
                </button>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className={styles.selectWrapper}>
                <select
                    className={styles.filterSelect}
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <ChevronDown size={14} strokeWidth={1.5} className={styles.selectIcon} />
                </div>


                <div className={styles.selectWrapper}>
                <select
                    className={styles.filterSelect}
                    value={genderFilter}
                    onChange={e => setGenderFilter(e.target.value)}
                >
                    <option value="">Todos los géneros</option>
                    {genderOptions.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
                <ChevronDown size={14} strokeWidth={1.5} className={styles.selectIcon} />
                </div>

                <div className={styles.selectWrapper}>
                <select
                    className={styles.filterSelect}
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>
                <ChevronDown size={14} strokeWidth={1.5} className={styles.selectIcon} />
                </div>

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
                            {filtered.map(product => {
                                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                                return (
                                    <tr key={product.id} className={!product.state ? styles.rowInactive : ''}>
                                        <td>
                                            <div className={styles.productCell}>
                                                {primaryImage?.url && (
                                                    <img
                                                        src={primaryImage?.url}
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

                                    {/* Estado */}
                                    <td className={styles.cell}>
                                        {product.isDraft ? (
                                            <span className={`${styles.badge} ${styles.badgeDraft}`}>Borrador</span>
                                        ) : (
                                            <span className={`${styles.badge} ${product.state ? styles.badgeActive : styles.badgeInactive}`}>
                                                {product.state ? 'Activo' : 'Inactivo'}
                                            </span>
                                        )}
                                    </td>

                                {/* Acciones */}
                                <td className={styles.cell}>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                            title="Editar"
                                        >
                                        <Pencil size={15} strokeWidth={1.5} />
                                    </button>

                                        {product.isDraft ? (
                                            <>
                                            <button
                                                    className={styles.iconBtn}
                                                    onClick={() => handlePublish(product)}
                                                    title="Publicar"
                                                >
                                                    <Upload size={15} strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    className={styles.iconBtn}
                                                    onClick={() => handleDeleteDraft(product.id)}
                                                    title="Eliminar borrador"
                                                >
                                                    <Trash2 size={15} strokeWidth={1.5} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => handleToggleState(product.id, product.state)}
                                                title={product.state ? 'Desactivar' : 'Activar'}
                                            >
                                                {product.state ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                                            </button>
                                        )}
                                    </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && !loading && (
                        <p className={styles.empty}>No se encontraron productos</p>
                    )}
                </div>
            )}

            {variantProduct && (
        <div className={styles.modalOverlay} onClick={() => { setVariantProduct(null); setStockEdits({}) }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{variantProduct.name}</h2>
                    <button className={styles.closeBtn} onClick={() => { setVariantProduct(null); setStockEdits({}) }}>✕</button>
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
        <ConfirmModal
            isOpen={!!productToDelete}
            title="Eliminar borrador"
            message="¿Eliminar este borrador? Esta acción no se puede deshacer."
            confirmLabel="Eliminar"
            danger
            onConfirm={confirmDeleteDraft}
            onCancel={() => setProductToDelete(null)}
        />
        <Toast toast={toast} onHide={hideToast} />

        </div>
    )
}

export default Products;