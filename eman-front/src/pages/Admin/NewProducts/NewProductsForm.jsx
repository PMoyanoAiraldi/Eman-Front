import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Star } from 'lucide-react'
import {
    createProduct,
    createProductVariant,
    addProductImage,
    setPrimaryImage,
    fetchAllProducts,
} from '../../../redux/admin/adminProductsReducer'
import { useToast } from '../../../hooks/useToast'
import Toast from '../../../components/Toast/Toast'
import axiosInstance from '../../../api/axiosInstance'
import styles from '../NewProducts/NewProducts.module.css'

const NewProductsForm = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { toast, showToast, hideToast } = useToast()

    // Datos del producto (fase 1)
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        gender: '',
        isFeatured: false,
        brandId: '',
        categoryId: '',
        subcategoryId: '',
        productTypeId: '',
    })
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [productTypes, setProductTypes] = useState([])
    const [brands, setBrands] = useState([])
    const [creatingProduct, setCreatingProduct] = useState(false)
    const [createdProduct, setCreatedProduct] = useState(null) // producto ya creado en el back

    // Variantes (fase 2)
    const [colors, setColors] = useState([])
    const [sizes, setSizes] = useState([])
    const [variantForm, setVariantForm] = useState({ colorId: '', sizeId: '', stock: '' })
    const [addingVariant, setAddingVariant] = useState(false)
    const [variants, setVariants] = useState([])

    // Imágenes (fase 2)
    const [images, setImages] = useState([])
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        axiosInstance.get('/categories').then(r => setCategories(r.data)).catch(() => {})
        axiosInstance.get('/sub_categories').then(r => setSubCategories(r.data)).catch(() => {})
        axiosInstance.get('/product_types').then(r => setProductTypes(r.data)).catch(() => {})
        axiosInstance.get('/brands').then(r => setBrands(r.data)).catch(() => {})
        axiosInstance.get('/colors').then(r => setColors(r.data)).catch(() => {})
        axiosInstance.get('/sizes').then(r => setSizes(r.data)).catch(() => {})
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleCreateProduct = async () => {
        if (!form.name || !form.description || !form.price || !form.categoryId || !form.subcategoryId) {
            showToast('Completá nombre, descripción, precio, categoría y subcategoría', 'error')
            return
        }
        setCreatingProduct(true)
        try {
            const result = await dispatch(createProduct({
                ...form,
                price: Number(form.price),
                brandId: form.brandId || undefined,
                productTypeId: form.productTypeId || undefined,
            })).unwrap()
            setCreatedProduct(result)
            showToast('Producto creado. Ahora agregá variantes e imágenes.')
        } catch (err) {
            showToast(err || 'Error al crear el producto', 'error')
        } finally {
            setCreatingProduct(false)
        }
    }

    const handleVariantChange = (e) => {
        const { name, value } = e.target
        if (name === 'stock' && !/^\d*$/.test(value)) return
        setVariantForm(prev => ({ ...prev, [name]: value }))
    }

    const handleAddVariant = async () => {
        if (!variantForm.colorId || !variantForm.sizeId || variantForm.stock === '') {
            showToast('Completá color, talle y stock', 'error')
            return
        }
        setAddingVariant(true)
        try {
            const result = await dispatch(createProductVariant({
                productId: createdProduct.id,
                colorId: variantForm.colorId,
                sizeId: variantForm.sizeId,
                stock: Number(variantForm.stock),
            })).unwrap()
            setVariants(prev => [...prev, result])
            setVariantForm({ colorId: '', sizeId: '', stock: '' })
            showToast('Variante agregada')
        } catch (err) {
            showToast(err || 'Error al agregar la variante', 'error')
        } finally {
            setAddingVariant(false)
        }
    }

    const handleSetPrimary = async (imageId) => {
    try {
        await dispatch(setPrimaryImage(imageId)).unwrap()
        setImages(prev => prev.map(img => ({
            ...img,
            isPrimary: img.id === imageId
        })))
        showToast('Imagen principal actualizada')
    } catch (err) {
        showToast(err || 'Error al actualizar imagen principal', 'error')
    }
}

    const handleAddImage = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingImage(true)
        try {
            const result = await dispatch(addProductImage({ productId: createdProduct.id, file })).unwrap()
            setImages(prev => [...prev, result])
            showToast('Imagen agregada correctamente')
        } catch (err) {
            showToast(err || 'Error al agregar la imagen', 'error')
        } finally {
            setUploadingImage(false)
            e.target.value = ''
        }
    }

    const handleFinish = () => {
        dispatch(fetchAllProducts())
        navigate('/admin/products')
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/admin/products')}>
                    <ArrowLeft size={16} strokeWidth={1.5} />
                    Volver a productos
                </button>
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>Nuevo producto</h1>
                <p className={styles.subtitle}>
                    {createdProduct ? createdProduct.name : 'Completá los datos para crear el producto'}
                </p>
            </div>

            <div className={styles.grid}>
                {/* SECCIÓN: Datos del producto */}
                <section className={styles.card}>
                    <p className={styles.sectionLabel}>Datos del producto</p>

                    <div className={styles.field}>
                        <label className={styles.label}>NOMBRE</label>
                        <input className={styles.input} name="name" value={form.name} onChange={handleChange} disabled={!!createdProduct} />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>DESCRIPCIÓN</label>
                        <textarea className={styles.textarea} name="description" value={form.description} onChange={handleChange} rows={3} disabled={!!createdProduct} />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>PRECIO</label>
                            <input className={styles.input} name="price" type="number" value={form.price} onChange={handleChange} disabled={!!createdProduct} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>GÉNERO</label>
                            <select className={styles.input} name="gender" value={form.gender} onChange={handleChange} disabled={!!createdProduct}>
                                <option value="">Sin especificar</option>
                                <option value="mujer">Mujer</option>
                                <option value="hombre">Hombre</option>
                                <option value="unisex">Unisex</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>CATEGORÍA</label>
                            <select className={styles.input} name="categoryId" value={form.categoryId} onChange={handleChange} disabled={!!createdProduct}>
                                <option value="">Seleccioná</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>SUBCATEGORÍA</label>
                            <select className={styles.input} name="subcategoryId" value={form.subcategoryId} onChange={handleChange} disabled={!!createdProduct}>
                                <option value="">Seleccioná</option>
                                {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>MARCA</label>
                        <select className={styles.input} name="brandId" value={form.brandId} onChange={handleChange} disabled={!!createdProduct}>
                            <option value="">Sin marca</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                        <div className={styles.field}>
                            <label className={styles.label}>TIPO DE PRODUCTO</label>
                            <select className={styles.input} name="productTypeId" value={form.productTypeId} onChange={handleChange} disabled={!!createdProduct}>
                                <option value="">Sin tipo</option>
                                {productTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>DESTACADO</label>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={form.isFeatured}
                                    onChange={handleChange}
                                    className={styles.checkbox}
                                    disabled={!!createdProduct}
                                />
                                Mostrar en destacados
                            </label>
                        </div>
                    </div>

                    {!createdProduct && (
                        <button className={styles.saveBtn} onClick={handleCreateProduct} disabled={creatingProduct}>
                            {creatingProduct ? 'Creando...' : 'Crear producto'}
                        </button>
                    )}
                </section>

                {/* SECCIÓN: Variantes + Imágenes (solo una vez creado el producto) */}
                {createdProduct && (
                    <section className={styles.card}>
                        <p className={styles.sectionLabel}>Variantes (color / talle / stock)</p>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>COLOR</label>
                                <select className={styles.input} name="colorId" value={variantForm.colorId} onChange={handleVariantChange}>
                                    <option value="">Seleccioná</option>
                                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>TALLE</label>
                                <select className={styles.input} name="sizeId" value={variantForm.sizeId} onChange={handleVariantChange}>
                                    <option value="">Seleccioná</option>
                                    {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>STOCK</label>
                            <input className={styles.input} name="stock" type="text" value={variantForm.stock} onChange={handleVariantChange} />
                        </div>

                        <button className={styles.saveBtn} onClick={handleAddVariant} disabled={addingVariant}>
                            {addingVariant ? 'Agregando...' : 'Agregar variante'}
                        </button>

                        {variants.length > 0 && (
                            <ul style={{ marginTop: '0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: '#444' }}>
                                {variants.map(v => (
                                    <li key={v.id}>
                                        {v.color?.name} / {v.size?.name} — stock: {v.stock}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <p className={styles.sectionLabel} style={{ marginTop: '1rem' }}>Imágenes</p>

                        <div className={styles.imagesGrid}>
                            {images.map(img => (
                                <div key={img.id} className={`${styles.imageCard} ${img.isPrimary ? styles.imageCardPrimary : ''}`}>
                                    <img src={img.url} alt="producto" className={styles.image} />
                                    {img.isPrimary && <span className={styles.primaryBadge}>Principal</span>}

                                <div className={styles.imageActions}>
                                    {!img.isPrimary && (
                                        <button className={styles.imageBtn} onClick={() => handleSetPrimary(img.id)} title="Marcar como principal">
                                            <Star size={14} strokeWidth={1.5} />
                                        </button>
                                    )}
                                    </div>
                                </div>
                            ))}
                            <label className={`${styles.imageCard} ${styles.addImageCard}`}>
                                {uploadingImage ? (
                                    <p className={styles.uploadingText}>Subiendo...</p>
                                ) : (
                                    <>
                                        <Upload size={20} strokeWidth={1.5} color="#aaa" />
                                        <span className={styles.addImageText}>Agregar imagen</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" className={styles.fileInputHidden} onChange={handleAddImage} disabled={uploadingImage} />
                            </label>
                        </div>

                        <button className={styles.saveBtn} onClick={handleFinish}>
                            Finalizar
                        </button>
                    </section>
                )}
            </div>

            <Toast toast={toast} onHide={hideToast} />
        </div>
    )
}

export default NewProductsForm