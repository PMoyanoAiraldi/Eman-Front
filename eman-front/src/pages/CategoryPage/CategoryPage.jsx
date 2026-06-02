import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsByCategory } from '../../redux/productsReducer'
import { fetchSubCategories } from '../../redux/subCategoriesReducer'
import ProductCard from '../../components/ProductCard/ProductCard'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import styles from './CategoryPage.module.css'
import axios from "axios"

const CategoryPage = () => {
    const { categoria } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const subParam = searchParams.get('sub')

    const { products, loading } = useSelector(state => state.products)
    const { subCategories } = useSelector(state => state.subCategories)

    const [categoryId, setCategoryId] = useState(null)

    // const [activeSubCategory, setActiveSubCategory] = useState(searchParams.get('sub') ?? null)
    // const activeSubName = subCategories.find(sc => sc.id === activeSubCategory)?.name

    const activeSubCategory = subParam ?? null
    const activeSubName = subCategories.find(sc => sc.id === activeSubCategory)?.name

  // Traer categorías del back para matchear con la URL
useEffect(() => {
    const fetchCategoryId = async () => {
        try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/categories`)
        console.log('Categorías recibidas:', res.data)
        const match = res.data.find(c => c.name?.toLowerCase() === categoria.toLowerCase())
        if (match) {
        setCategoryId(match.id)
        }
        } catch (err) {
        console.error('Error al cargar categorías:', err)
        }
    }
        fetchCategoryId()
    }, [categoria])


  // Cuando tenemos el categoryId traemos los productos
    useEffect(() => {
        if (!categoryId) return
        dispatch(fetchProductsByCategory(categoryId))
        dispatch(fetchSubCategories())
        }, [categoryId, dispatch])

        // Subcategorías filtradas para esta categoría
        const filteredSubCategories = subCategories.filter(
            sc => sc.category?.id === categoryId
        )

        // Productos filtrados por subcategoría activa
        const filteredProducts = activeSubCategory
            ? products.filter(p => p.subcategory?.id === activeSubCategory)
            : products

        return (
            <section className={styles.page}>

            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: categoria, path: `/${categoria.toLowerCase()}` },
                ...(activeSubName ? [{ label: activeSubName }] : []),
            ]} />

            <div className={styles.header}>
                <h1 className={styles.title}>{categoria}</h1>
                <span className={styles.count}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
            </div>

            {filteredSubCategories.length > 0 && (
                <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${activeSubCategory === null ? styles.active : ''}`}
                    onClick={() => navigate(`/${categoria.toLowerCase()}`)}
                >
                    Todos
                </button>
                {filteredSubCategories.map(sc => (
                    <button
                    key={sc.id}
                    className={`${styles.filterBtn} ${activeSubCategory === sc.id ? styles.active : ''}`}
                    onClick={() => navigate(`/${categoria.toLowerCase()}?sub=${sc.id}`)}
                    >
                    {sc.name}
                    </button>
                ))}
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Cargando...</div>
            ) : filteredProducts.length === 0 ? (
                <div className={styles.empty}>No hay productos en esta categoría.</div>
            ) : (
                <div className={styles.grid}>
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            )}

            </section>
        )
    }

export default CategoryPage