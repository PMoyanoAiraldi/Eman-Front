import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Star, Plus } from 'lucide-react'
import {
    createProduct,
    createProductVariant,
    addProductImage,
    setPrimaryImage,
    fetchAllProducts,
} from '../../../redux/admin/adminProductsReducer'
import { useToast } from '../../../hooks/useToast'
import Toast from '../../../components/Toast/Toast'
import Stepper from '../../../components/Stepper/Stepper'
import axiosInstance from '../../../api/axiosInstance'
import styles from '../NewProducts/NewProducts.module.css'


const STEPS = ['Datos del producto', 'Variantes', 'Imágenes', 'Confirmación']

const InlineAddPopover = ({ label, placeholder, onCreate, disabled }) => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!value.trim()) return
        setSaving(true)
        try {
            await onCreate(value.trim())
            setValue('')
            setOpen(false)
        } catch {
            // el error ya se muestra vía toast dentro de onCreate
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.inlineAddWrapper}>
            <button
                type="button"
                className={styles.inlineAddBtn}
                onClick={() => setOpen(prev => !prev)}
                disabled={disabled}
                title={`Agregar ${label}`}
            >
                <Plus size={14} strokeWidth={2} />
            </button>
            {open && (
                <div className={styles.inlineAddPopover}>
                    <input
                    className={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        autoFocus
                    />
                    <div className={styles.inlineAddActions}>
                        <button type="button" className={styles.inlineAddSave} onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" className={styles.inlineAddCancel} onClick={() => { setOpen(false); setValue('') }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}


const NewProductsForm = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { toast, showToast, hideToast } = useToast()
    const [currentStep, setCurrentStep] = useState(1)

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

    const handleCreateBrand = async (name) => {
        try {
            const res = await axiosInstance.post('/brands', { name })
            setBrands(prev => [...prev, res.data])
            setForm(prev => ({ ...prev, brandId: res.data.id }))
            showToast('Marca agregada')
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al crear la marca', 'error')
            throw err
        }
    }

    const handleCreateProductType = async (name) => {
        try {
            const res = await axiosInstance.post('/product_types', { name })
            setProductTypes(prev => [...prev, res.data])
            setForm(prev => ({ ...prev, productTypeId: res.data.id }))
            showToast('Tipo de producto agregado')
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al crear el tipo de producto', 'error')
            throw err
        }
    }

    const handleCreateSubCategory = async (name) => {
        if (!form.categoryId) {
            showToast('Primero seleccioná una categoría', 'error')
            throw new Error('Sin categoría')
        }
        try {
            const res = await axiosInstance.post('/sub_categories', { name, categoryId: form.categoryId })
            setSubCategories(prev => [...prev, res.data])
            setForm(prev => ({ ...prev, subcategoryId: res.data.id }))
            showToast('Subcategoría agregada')
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al crear la subcategoría', 'error')
            throw err
        }
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
            showToast('Producto creado')
            setCurrentStep(2)
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

            <Stepper currentStep={currentStep} steps={STEPS} />

            <div className={styles.stepContent}>
                {/* SECCIÓN: Datos del producto */}
                {currentStep === 1 && (
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
                        <InlineAddPopover
                            label="subcategoría"
                            placeholder="Nombre de la subcategoría"
                            onCreate={handleCreateSubCategory}
                            disabled={!form.categoryId}
                        />
                    </div>
                </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>MARCA</label>
                            <select className={styles.input} name="brandId" value={form.brandId} onChange={handleChange}>
                                <option value="">Sin marca</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <InlineAddPopover
                                label="marca"
                                placeholder="Nombre de la marca"
                                onCreate={handleCreateBrand}
                            />
                        </div>
                    
                        <div className={styles.field}>
                            <label className={styles.label}>TIPO DE PRODUCTO</label>
                            <select className={styles.input} name="productTypeId" value={form.productTypeId} onChange={handleChange}>
                                <option value="">Sin tipo</option>
                                {productTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <InlineAddPopover
                                label="tipo de producto"
                                placeholder="Nombre del tipo"
                                onCreate={handleCreateProductType}
                            />
                        </div>
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
                    
                    <button className={styles.saveBtn} onClick={handleCreateProduct} disabled={creatingProduct}>
                        {creatingProduct ? 'Creando...' : 'Siguiente'}
                    </button>
                </section>
            )}

                {currentStep === 2 && (
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
                            <ul className={styles.variantList}>
                                {variants.map(v => (
                                    <li key={v.id}>{v.color?.name} / {v.size?.name} — stock: {v.stock}</li>
                                ))}
                            </ul>
                        )}

                        <button
                            className={styles.saveBtn}
                            onClick={() => {
                                if (variants.length === 0) {
                                    showToast('Agregá al menos una variante para continuar', 'error')
                                    return
                                }
                                setCurrentStep(3)
                            }}
                        >
                            Siguiente
                        </button>
                    </section>
                )}

                    {currentStep === 3 && (
                    <section className={styles.card}>
                        <p className={styles.sectionLabel}>Imágenes</p>

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

                        <button
                            className={styles.saveBtn}
                            onClick={() => {
                                if (images.length === 0) {
                                    showToast('Agregá al menos una imagen para continuar', 'error')
                                    return
                                }
                                setCurrentStep(4)
                            }}
                        >
                            Siguiente
                        </button>
                    </section>
                )}
                {currentStep === 4 && (
                        <section className={styles.card}>
                            <p className={styles.sectionLabel}>Confirmación</p>
                            <p><strong>{createdProduct?.name}</strong></p>
                            <p>${Number(createdProduct?.price).toLocaleString('es-AR')}</p>
                            <p>{variants.length} variante(s) cargada(s)</p>
                            <p>{images.length} imagen(es) cargada(s)</p>

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