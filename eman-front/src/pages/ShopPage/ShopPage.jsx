import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllProducts } from '../../redux/slices/productsReducer'
import { fetchSubCategories } from '../../redux/slices/subCategoriesReducer'
import ProductCard from '../../components/ProductCard/ProductCard'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import axios from 'axios'
import styles from '../CategoryPage/CategoryPage.module.css'

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch()

    const categoryParam = searchParams.get('categoria')
    const subParam = searchParams.get('sub')

    const { products, loadingProducts: loading } = useSelector(state => state.products)
    const { subCategories } = useSelector(state => state.subCategories)
    const [categories, setCategories] = useState([])

    // Traer todas las categorías para el filtro
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/categories`)
            .then(res => setCategories(res.data))
            .catch(err => console.error('Error al cargar categorías:', err))
    }, [])

    // Resolver categoryId a partir del nombre en la URL
    const activeCategory = categories.find(c => c.name?.toLowerCase() === categoryParam?.toLowerCase())
    const activeCategoryId = activeCategory?.id ?? null

    // Traer productos cada vez que cambia el filtro
    useEffect(() => {
        dispatch(fetchAllProducts({ categoryId: activeCategoryId, subcategoryId: subParam }))
    }, [activeCategoryId, subParam, dispatch])

    useEffect(() => {
        dispatch(fetchSubCategories())
    }, [dispatch])

    // Subcategorías visibles: solo si hay una categoría activa
    const visibleSubCategories = activeCategoryId
        ? subCategories.filter(sc => sc.category?.id === activeCategoryId)
        : []

    const handleCategoryClick = (catName) => {
        if (!catName) {
            setSearchParams({})
        } else {
            setSearchParams({ categoria: catName.toLowerCase() })
        }
    }

    const handleSubClick = (subId) => {
        const params = { categoria: categoryParam }
        if (subId) params.sub = subId
        setSearchParams(params)
    }

    return (
        <section className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Tienda', path: '/tienda' },
            ]} />

            <div className={styles.header}>
                <h1 className={styles.title}>Tienda</h1>
                <span className={styles.count}>
                    {products.length} {products.length === 1 ? 'producto' : 'productos'}
                </span>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${!categoryParam ? styles.active : ''}`}
                    onClick={() => handleCategoryClick(null)}
                >
                    Todas
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.filterBtn} ${categoryParam === cat.name.toLowerCase() ? styles.active : ''}`}
                        onClick={() => handleCategoryClick(cat.name)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {visibleSubCategories.length > 0 && (
                <div className={styles.subFilters}>
                <span className={styles.subFilterLabel}>Subcategoría:</span>
                    <button
                        className={`${styles.subFilterBtn} ${!subParam ? styles.subFilterBtnActive  : ''}`}
                        onClick={() => handleSubClick(null)}
                    >
                        Todas 
                    </button>
                    {visibleSubCategories.map(sc => (
                        <button
                            key={sc.id}
                            className={`${styles.subFilterBtn} ${subParam === sc.id ? styles.subFilterBtnActive : ''}`}
                            onClick={() => handleSubClick(sc.id)}
                        >
                            {sc.name}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Cargando...</div>
            ) : products.length === 0 ? (
                <div className={styles.empty}>No hay productos disponibles.</div>
            ) : (
                <div className={styles.grid}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default ShopPage