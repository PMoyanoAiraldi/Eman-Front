import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Eye, EyeOff, Star } from 'lucide-react'
import { fetchAllProducts, toggleProductState, updateProduct } from '../../../redux/admin/adminProductsReducer'
import styles from './Products.module.css'

const Products = ()=> {
    const dispatch = useDispatch()
    const { products, loading, error } = useSelector(state => state.adminProducts)

    console.log("products", products)

    const [search, setSearch] = useState('')
    const [editingProduct, setEditingProduct] = useState(null)

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
            data: { is_featured: !product.is_featured }
        }))
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
                                    <td className={styles.cell}>
                                        ${Number(product.price).toLocaleString('es-AR')}
                                    </td>
                                    <td className={styles.cell}>
                                        {product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0}
                                    </td>
                                    <td className={styles.cell}>
                                        <button
                                            className={`${styles.iconBtn} ${product.is_featured ? styles.featuredActive : ''}`}
                                            onClick={() => handleToggleFeatured(product)}
                                            title={product.is_featured ? 'Quitar destacado' : 'Marcar destacado'}
                                        >
                                            <Star size={16} strokeWidth={1.5} fill={product.is_featured ? 'currentColor' : 'none'} />
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
        </div>
    )
}

export default Products;