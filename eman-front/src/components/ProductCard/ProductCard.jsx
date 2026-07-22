import { useNavigate } from 'react-router-dom'
import styles from './ProductCard.module.css'

const ProductCard = ({ product}) => {
    const navigate = useNavigate()
    const image = product.images?.[0]?.url
    const hasStock = product.variants?.some(s => s.stock > 0)
    const sizesWithStock = product.variants?.filter(ps => ps.stock > 0)


    // Obtener colores únicos que tengan stock
    const colorsWithStock = product.variants
        ?.filter(v => v.stock > 0 && v.color)
        .reduce((acc, v) => {
            if (!acc.find(c => c.id === v.color.id)) acc.push(v.color)
            return acc
    }, [])

    return (
        <article
        className={styles.card}
        onClick={() => navigate(`/product/${product.id}`)}
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

            {colorsWithStock?.length > 0 && (
            <div className={styles.colors}>
                {colorsWithStock.map(color => (
                    <span
                        key={color.id}
                        className={styles.colorDot}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    />
                ))}
            </div>
        )}
        </div>
        </article>
    )
}

export default ProductCard