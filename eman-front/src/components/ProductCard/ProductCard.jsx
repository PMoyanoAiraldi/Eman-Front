import { useNavigate } from 'react-router-dom'
import styles from './ProductCard.module.css'

const ProductCard = ({ product }) => {
    const navigate = useNavigate()
    const image = product.images?.[0]?.url
    const hasStock = product.productSizes?.some(s => s.stock > 0)
    const sizesWithStock = product.productSizes?.filter(ps => ps.stock > 0)

    return (
        <article
        className={styles.card}
        onClick={() => navigate(`/producto/${product.id}`)}
        >
        <div className={styles.imageWrapper}>
            {image
            ? <img src={image} alt={product.name} />
            : <div className={styles.imagePlaceholder} />
            }
            {!hasStock && <span className={styles.soldOut}>Sin stock</span>}
        </div>

        <div className={styles.info}>
            <span className={styles.category}>{product.category?.name}</span>
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
}

export default ProductCard