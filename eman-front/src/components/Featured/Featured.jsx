import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './Featured.module.css'

const FeaturedProducts = () => {
    const [products, setProducts] = useState([])
    const navigate = useNavigate()
    

    useEffect(() => {
        axios.get('http://localhost:3010/products/featured')
            .then(res => {
                if (res.data?.length > 0) setProducts(res.data)
            })
            .catch(err => console.error('Error al cargar destacados:', err))
    }, [])

    if (products.length === 0) return null

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <span className={styles.eyebrow}>Selección</span>
                <h2 className={styles.title}>Destacados</h2>
            </div>

            <div className={styles.grid}>
                {products.map(product => {
                    const image = product.images?.[0]?.url
                    const hasStock = product.productSizes?.some(s => s.stock > 0)
                    const sizesWithStock = product.productSizes?.filter(ps => ps.stock > 0)
                    
                    return (
                        <article
                            key={product.id}
                            className={styles.card}
                            onClick={() => navigate(`/producto/${product.id}`)}
                        >
                            <div className={styles.imageWrapper}>
                                {image
                                    ? <img src={image} alt={product.name} />
                                    : <div className={styles.imagePlaceholder} />
                                }
                                {!hasStock && (
                                    <span className={styles.soldOut}>Sin stock</span>
                                )}
                            </div>

                            <div className={styles.info}>
                                <span className={styles.category}>
                                    {product.category?.name}
                                </span>
                                <h3 className={styles.name}>{product.name}</h3>
                                <p className={styles.price}>
                                    ${Number(product.price).toLocaleString('es-AR')}
                                </p>
                                {sizesWithStock?.length > 0 && (
                            <div className={styles.sizes}>
                                {sizesWithStock.map(ps => (
                                    <span key={ps.id} className={styles.sizeTag}>
                                        {ps.size.name}
                                    </span>
                                ))}
                                </div>
                            )}

                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

export default FeaturedProducts