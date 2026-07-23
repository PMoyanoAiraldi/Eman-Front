import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './Featured.module.css'
import { fetchFeaturedProducts } from '../../redux/slices/productsReducer'
import ProductCard from '../ProductCard/ProductCard'

const FeaturedProducts = () => {
    const dispatch = useDispatch()
    const { featuredProducts, loadingFeatured: loading  } = useSelector(state => state.products)
    

    useEffect(() => {
        dispatch(fetchFeaturedProducts())
    }, [dispatch])

    if (loading || featuredProducts.length === 0) return null

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.eyebrow}>Selección</span>
                <h2 className={styles.title}>Destacados</h2>
            </div>

            <div className={styles.grid}>
                {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    )
}

export default FeaturedProducts