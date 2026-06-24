import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Star, Upload } from 'lucide-react'
import {
    updateProduct,
    addProductImage,
    replaceProductImage,
    deleteProductImage,
    setPrimaryImage,
} from '../../../../redux/admin/adminProductsReducer'
import { useToast } from '../../../../hooks/useToast'
import Toast from '../../../../components/Toast/Toast'
import axiosInstance from '../../../../api/axiosInstance'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import styles from './EditProducts.module.css'

// Este componente recibe el producto garantizado como prop
// No tiene que lidiar con loading ni con producto null
const EditProductForm = ({ product }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { toast, showToast, hideToast } = useToast()

    // El form se inicializa directamente con el producto — sin useEffect
    const [form, setForm] = useState({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        gender: product.gender || '',
        isFeatured: product.isFeatured || false,
        categoryId: product.category?.id || '',
        subcategoryId: product.subcategory?.id || '',
        productTypeId: product.productType?.id || '',
    })

    const [images, setImages] = useState(product.images || [])
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [productTypes, setProductTypes] = useState([])
    const [savingData, setSavingData] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(null) // guarda el imageId a eliminar

    // Cargar selects — estos sí van en useEffect porque son datos externos
    useEffect(() => {
        axiosInstance.get('/categories').then(r => setCategories(r.data)).catch(() => {})
        axiosInstance.get('/sub_categories').then(r => setSubCategories(r.data)).catch(() => {})
        axiosInstance.get('/product_types').then(r => setProductTypes(r.data)).catch(() => {})
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSaveData = async () => {
        setSavingData(true)
        try {
            await dispatch(updateProduct({
                id: product.id,
                data: { ...form, price: Number(form.price) }
            })).unwrap()
            showToast('Producto actualizado correctamente')
        } catch (err) {
            showToast(err || 'Error al actualizar el producto', 'error')
        } finally {
            setSavingData(false)
        }
    }

    const handleAddImage = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingImage(true)
        try {
            const result = await dispatch(addProductImage({ productId: product.id, file })).unwrap()
            setImages(prev => [...prev, result])
            showToast('Imagen agregada correctamente')
        } catch (err) {
            showToast(err || 'Error al agregar la imagen', 'error')
        } finally {
            setUploadingImage(false)
            e.target.value = ''
        }
    }

    const handleReplaceImage = async (imageId, e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const result = await dispatch(replaceProductImage({ imageId, file })).unwrap()
            setImages(prev => prev.map(img =>
                img.id === imageId ? { ...img, url: result.imgUrl } : img
            ))
            showToast('Imagen reemplazada correctamente')
        } catch (err) {
            showToast(err || 'Error al reemplazar la imagen', 'error')
        } finally {
            e.target.value = ''
        }
    }

    const handleDeleteImage = async () => {
        if (!confirmDelete) return
        try {
            await dispatch(deleteProductImage(confirmDelete)).unwrap()
            setImages(prev => prev.filter(img => img.id !== confirmDelete))
            showToast('Imagen eliminada')
        } catch (err) {
            showToast(err || 'Error al eliminar la imagen', 'error')
        } finally {
        setConfirmDelete(null)
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

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/admin/products')}>
                    <ArrowLeft size={16} strokeWidth={1.5} />
                    Volver a productos
                </button>
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>Editar producto</h1>
                <p className={styles.subtitle}>{product.name}</p>
            </div>

            <div className={styles.grid}>
                {/* SECCIÓN: Datos del producto */}
                <section className={styles.card}>
                    <p className={styles.sectionLabel}>Datos del producto</p>

                    <div className={styles.field}>
                        <label className={styles.label}>NOMBRE</label>
                        <input className={styles.input} name="name" value={form.name} onChange={handleChange} />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>DESCRIPCIÓN</label>
                        <textarea className={styles.textarea} name="description" value={form.description} onChange={handleChange} rows={3} />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>PRECIO</label>
                            <input className={styles.input} name="price" type="number" value={form.price} onChange={handleChange} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>GÉNERO</label>
                            <select className={styles.input} name="gender" value={form.gender} onChange={handleChange}>
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
                            <select className={styles.input} name="categoryId" value={form.categoryId} onChange={handleChange}>
                                <option value="">Seleccioná</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>SUBCATEGORÍA</label>
                            <select className={styles.input} name="subcategoryId" value={form.subcategoryId} onChange={handleChange}>
                                <option value="">Seleccioná</option>
                                {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>TIPO DE PRODUCTO</label>
                            <select className={styles.input} name="productTypeId" value={form.productTypeId} onChange={handleChange}>
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
                                />
                                Mostrar en destacados
                            </label>
                        </div>
                    </div>

                    <button className={styles.saveBtn} onClick={handleSaveData} disabled={savingData}>
                        {savingData ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </section>

                {/* SECCIÓN: Imágenes */}
                <section className={styles.card}>
                    <p className={styles.sectionLabel}>Imágenes del producto</p>

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
                                    <label className={styles.imageBtn} title="Reemplazar imagen">
                                        <Upload size={14} strokeWidth={1.5} />
                                        <input type="file" accept="image/*" className={styles.fileInputHidden} onChange={e => handleReplaceImage(img.id, e)} />
                                    </label>
                                    <button className={`${styles.imageBtn} ${styles.imageBtnDelete}`} onClick={() => setConfirmDelete(img.id)} title="Eliminar imagen">
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </button>
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
                </section>
            </div>
            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Eliminar imagen"
                message="¿Estás segura que querés eliminar esta imagen? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                danger
                onConfirm={handleDeleteImage}
                onCancel={() => setConfirmDelete(null)}
            />              

            <Toast toast={toast} onHide={hideToast} />
        </div>
    )
}

export default EditProductForm;