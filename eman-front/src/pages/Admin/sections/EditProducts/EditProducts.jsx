import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchAllProducts } from '../../../../redux/admin/adminProductsReducer'
import EditProductForm from './EditProductForm'
import styles from './EditProducts.module.css'

// Este componente solo se encarga de garantizar que el producto exista
// antes de pasárselo al formulario
const EditProduct = () => {
    const { id } = useParams()
    const dispatch = useDispatch()

    const product = useSelector(state =>
        state.adminProducts.products.find(p => p.id === id)
    )
    const loading = useSelector(state => state.adminProducts.loading)

    useEffect(() => {
        if (!product) {
            dispatch(fetchAllProducts())
        }
    }, [])

    if (loading) return <p className={styles.loading}>Cargando producto...</p>
    if (!product) return <p className={styles.loading}>Producto no encontrado.</p>

    // Cuando el producto existe, renderizamos el form con el producto garantizado
    return <EditProductForm product={product} />
}

export default EditProduct;