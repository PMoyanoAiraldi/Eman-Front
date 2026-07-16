import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Star, Plus, Eye, EyeOff } from 'lucide-react'
import {
    createProduct,
    createProductVariant,
    addProductImage,
    setPrimaryImage,
    fetchAllProducts,
    publishProduct
} from '../../../redux/admin/adminProductsReducer'
import { useToast } from '../../../hooks/useToast'
import Toast from '../../../components/Toast/Toast'
import Stepper from '../../../components/Stepper/Stepper'
import axiosInstance from '../../../api/axiosInstance'
import styles from '../NewProducts/NewProducts.module.css'


const STEPS = ['Datos del producto', 'Variantes', 'Imágenes', 'Confirmación']

const InlineManagePopover = ({ label, placeholder, items = [], onCreate, onToggleState, disabled }) => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('')
    const [saving, setSaving] = useState(false)
    const [togglingId, setTogglingId] = useState(null)

    const handleSave = async () => {
        if (!value.trim()) return
        setSaving(true)
        try {
            await onCreate(value.trim())
            setValue('')
        } catch {
            // el error ya se muestra vía toast dentro de onCreate
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (item) => {
        setTogglingId(item.id)
        try {
            await onToggleState(item.id, !item.state)
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <>
        <button
                type="button"
                className={styles.inlineAddBtn}
                onClick={() => setOpen(true)}
                disabled={disabled}
                title={`Agregar ${label}`}
            >
                <Plus size={14} strokeWidth={2} />
            </button>
            {open && (
                <div className={styles.manageModalOverlay} onClick={() => setOpen(false)}>
                    <div className={styles.manageModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.manageModalHeader}>
                            <h3 className={styles.manageModalTitle}>Agregar {label}</h3>
                            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
                        </div>

                        <div className={styles.manageModalAdd}>
                            <input
                                className={styles.input}
                                placeholder={placeholder}
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                autoFocus
                            />
                        <button type="button" className={styles.manageModalAddBtn} onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Agregar'}
                        </button>
                    </div>

                    {items.length > 0 ? (
                        <ul className={styles.manageList}>
                            {items.map(item => (
                                <li key={item.id} className={styles.manageItem}>
                                    <span className={`${styles.manageItemName} ${!item.state ? styles.manageItemInactive : ''}`}>
                                        {item.name}
                                    </span>
                                    <button
                                            type="button"
                                            className={styles.manageToggleBtn}
                                            onClick={() => handleToggle(item)}
                                            disabled={togglingId === item.id}
                                            title={item.state ? 'Desactivar' : 'Activar'}
                                        >
                                            {item.state
                                                ? <Eye size={14} strokeWidth={1.5} />
                                                : <EyeOff size={14} strokeWidth={1.5} />
                                            }
                                        </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                            <p className={styles.manageEmpty}>Todavía no hay {label}s cargadas.</p>
                    )}
                </div>
        </div>
        )}
        </>
    )
}

const InlineManageColorModal = ({ items = [], onCreate, onToggleState }) => {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [hex, setHex] = useState('#000000')
    const [saving, setSaving] = useState(false)
    const [togglingId, setTogglingId] = useState(null)

    const handleSave = async () => {
        if (!name.trim()) return
        setSaving(true)
        try {
            await onCreate(name.trim(), hex)
            setName('')
            setHex('#000000')
        } catch {
            // el error ya se muestra vía toast dentro de onCreate
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (item) => {
        setTogglingId(item.id)
        try {
            await onToggleState(item.id, !item.state)
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <>
            <button type="button" className={styles.inlineAddBtn} onClick={() => setOpen(true)} title="Gestionar colores">
                <Plus size={14} strokeWidth={2} />
            </button>
            {open && (
                <div className={styles.manageModalOverlay} onClick={() => setOpen(false)}>
                    <div className={styles.manageModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.manageModalHeader}>
                            <h3 className={styles.manageModalTitle}>Gestionar colores</h3>
                            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
                        </div>
                    <div className={styles.manageModalAdd}>
                            <div className={styles.colorInputRow}>
                                <input
                                    type="color"
                                    className={styles.colorPicker}
                                    value={hex}
                                    onChange={e => setHex(e.target.value)}
                                />
                                <input
                                    className={styles.input}
                                    placeholder="Nombre del color"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        <button type="button" className={styles.manageModalAddBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Guardando...' : 'Agregar'}
                            </button>
                        </div>

                        {items.length > 0 ? (
                            <ul className={styles.manageList}>
                                {items.map(item => (
                                    <li key={item.id} className={styles.manageItem}>
                                        <span className={styles.manageItemColorRow}>
                                            <span className={styles.manageItemSwatch} style={{ background: item.hex }} />
                                            <span className={`${styles.manageItemName} ${!item.state ? styles.manageItemInactive : ''}`}>
                                                {item.name}
                                            </span>
                                            </span>
                                        <button
                                            type="button"
                                            className={styles.manageToggleBtn}
                                            onClick={() => handleToggle(item)}
                                            disabled={togglingId === item.id}
                                            title={item.state ? 'Desactivar' : 'Activar'}
                                        >
                                            {item.state ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.manageEmpty}>Todavía no hay colores cargados.</p>
                        )}
                    </div>
                </div>
            )}
        </>
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
    const { products: allProducts } = useSelector(state => state.adminProducts)
    const FEATURED_LIMIT = 4
    const featuredCount = allProducts.filter(p => p.isFeatured && p.state).length

    // Imágenes (fase 2)
    const [images, setImages] = useState([])
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        axiosInstance.get('/categories').then(r => setCategories(r.data)).catch(() => {})
        axiosInstance.get('/sub_categories/all').then(r => setSubCategories(r.data)).catch(() => {})
        axiosInstance.get('/product_types/all').then(r => setProductTypes(r.data)).catch(() => {})
        axiosInstance.get('/brands/all').then(r => setBrands(r.data)).catch(() => {})
        axiosInstance.get('/colors/all').then(r => setColors(r.data)).catch(() => {})
        axiosInstance.get('/sizes/all').then(r => setSizes(r.data)).catch(() => {})
    }, [])

    useEffect(() => {
    if (allProducts.length === 0) {
        dispatch(fetchAllProducts())
    }
}, [dispatch, allProducts.length])

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

    const handleCreateColor = async (name, hex) => {
    try {
        const res = await axiosInstance.post('/colors', { name, hex })
        setColors(prev => [...prev, res.data])
        showToast('Color agregado')
    } catch (err) {
        showToast(err.response?.data?.message || 'Error al crear el color', 'error')
        throw err
    }
}

    const handleToggleColorState = async (id, state) => {
        try {
            const res = await axiosInstance.patch(`/colors/${id}/state`, { state })
            setColors(prev => prev.map(c => c.id === id ? res.data : c))
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al actualizar el color', 'error')
        }
    }

    const handleCreateSize = async (name) => {
    try {
        const res = await axiosInstance.post('/sizes', { name })
        setSizes(prev => [...prev, res.data])
        showToast('Talle agregado')
    } catch (err) {
        showToast(err.response?.data?.message || 'Error al crear el talle', 'error')
        throw err
    }
    }

    const handleToggleSizeState = async (id, state) => {
        try {
            const res = await axiosInstance.patch(`/sizes/${id}/state`, { state })
            setSizes(prev => prev.map(s => s.id === id ? res.data : s))
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al actualizar el talle', 'error')
        }
    }

    const handleToggleBrandState = async (id, state) => {
    try {
        const res = await axiosInstance.patch(`/brands/${id}/state`, { state })
        setBrands(prev => prev.map(b => b.id === id ? res.data : b))
    } catch (err) {
        showToast(err.response?.data?.message || 'Error al actualizar la marca', 'error')
    }
}

    const handleToggleProductTypeState = async (id, state) => {
        try {
            const res = await axiosInstance.patch(`/product_types/${id}/state`, { state })
            setProductTypes(prev => prev.map(t => t.id === id ? res.data : t))
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al actualizar el tipo de producto', 'error')
        }
    }

    const handleToggleSubCategoryState = async (id, state) => {
        try {
            const res = await axiosInstance.patch(`/sub_categories/${id}/state`, { state })
            setSubCategories(prev => prev.map(s => s.id === id ? res.data : s))
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al actualizar la subcategoría', 'error')
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

    const handleFinish = async () => {
        try {
            await dispatch(publishProduct(createdProduct.id)).unwrap()
            showToast('Producto publicado correctamente')
            dispatch(fetchAllProducts())
            navigate('/admin/products')
        } catch (err) {
            showToast(err || 'Error al publicar el producto', 'error')
            
        }
        
    }

    const handleCategoryChange = (e) => {
        setForm(prev => ({ ...prev, categoryId: e.target.value, subcategoryId: '' }))
    }

    const handleFeaturedChange = (e) => {
    const checked = e.target.checked

    if (checked && featuredCount >= FEATURED_LIMIT) {
        showToast(`Ya tenés ${FEATURED_LIMIT} productos destacados. Destildá uno para agregar este.`, 'error')
        return
    }

    setForm(prev => ({ ...prev, isFeatured: checked }))
}


    return (
        <div className={styles.page}>
            <div className={styles.formWrapper}>
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
                        <select className={styles.input} name="categoryId" value={form.categoryId} onChange={handleCategoryChange}>
                            <option value="">Seleccioná</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                        <div className={styles.field}>
                        <label className={styles.label}>SUBCATEGORÍA</label>
                        <div className={styles.fieldRow}>
                        <select className={styles.input} name="subcategoryId" value={form.subcategoryId} onChange={handleChange}>
                            <option value="">Seleccioná</option>
                            {subCategories.filter(s => s.state && s.category?.id === form.categoryId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <InlineManagePopover
                            label="subcategoría"
                            placeholder="Nombre de la subcategoría"
                            items={subCategories.filter(s => s.category?.id === form.categoryId)}
                            onCreate={handleCreateSubCategory}
                            onToggleState={handleToggleSubCategoryState}
                            disabled={!form.categoryId}
                        />
                        </div>
                        {!form.categoryId && (
                            <span className={styles.hintText}>Elegí una categoría primero</span>
                        )}
                    </div>
                </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>MARCA</label>
                            <div className={styles.fieldRow}>
                            <select className={styles.input} name="brandId" value={form.brandId} onChange={handleChange}>
                                <option value="">Sin marca</option>
                                {brands.filter(b => b.state).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <InlineManagePopover
                                label="marca"
                                placeholder="Nombre de la marca"
                                items={brands}
                                onCreate={handleCreateBrand}
                                onToggleState={handleToggleBrandState}
                            />
                        </div>
                    </div>
                        <div className={styles.field}>
                            <label className={styles.label}>TIPO DE PRODUCTO</label>
                            <div className={styles.fieldRow}>
                            <select className={styles.input} name="productTypeId" value={form.productTypeId} onChange={handleChange}>
                                <option value="">Sin tipo</option>
                                {productTypes.filter(t => t.state).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <InlineManagePopover
                                label="tipo de producto"
                                placeholder="Nombre del tipo"
                                items={productTypes}
                                onCreate={handleCreateProductType}
                                onToggleState={handleToggleProductTypeState}
                            />
                        </div>
                    </div>
                    </div>

                        <div className={styles.field}>
                        <label className={styles.label}>DESTACADO</label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={form.isFeatured}
                                onChange={handleFeaturedChange}
                                className={styles.checkbox}
                            />
                            Mostrar en destacados
                        </label>
                        <span className={styles.featuredCount}>
                            {featuredCount + (form.isFeatured ? 1 : 0)}/{FEATURED_LIMIT} destacados en uso
                        </span>
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
                            <div className={styles.fieldLabelRow}>
                                <label className={styles.label}>COLOR</label>
                                <InlineManageColorModal
                                items={colors}
                                onCreate={handleCreateColor}
                                onToggleState={handleToggleColorState}
                            />
                            </div>
                            <div className={styles.colorSwatches}>
                                {colors.filter(c => c.state).map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`${styles.colorSwatch} ${variantForm.colorId === c.id ? styles.colorSwatchSelected : ''}`}
                                        style={{ background: c.hex || '#ccc' }}
                                        onClick={() => setVariantForm(prev => ({ ...prev, colorId: c.id }))}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            {variantForm.colorId && (
                                <span className={styles.colorSelectedName}>
                                    {colors.find(c => c.id === variantForm.colorId)?.name}
                                </span>
                            )}
                            </div>

                            <div className={styles.field}>
                            <div className={styles.fieldLabelRow}>
                            <label className={styles.label}>TALLE</label>
                            <InlineManagePopover
                                    label="talle"
                                    placeholder="Nombre del talle"
                                    items={sizes}
                                    onCreate={handleCreateSize}
                                    onToggleState={handleToggleSizeState}
                                />
                            </div>
                            <div className={styles.sizeChips}>
                            {sizes.filter(s => s.state).map(s => (
                            <button
                                key={s.id}
                                type="button"
                                className={`${styles.sizeChip} ${variantForm.sizeId === s.id ? styles.sizeChipSelected : ''}`}
                                onClick={() => setVariantForm(prev => ({ ...prev, sizeId: s.id }))}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>
                </div>

                        <div className={`${styles.field} ${styles.stockFieldSpacing}`}>
                            <label className={styles.label}>STOCK</label>
                            <input className={styles.input} name="stock" type="text" value={variantForm.stock} onChange={handleVariantChange} />
                        </div>

                        <button className={styles.addVariantBtn} onClick={handleAddVariant} disabled={addingVariant}>
                            {addingVariant ? 'Agregando...' : 'Agregar variante'}
                        </button>

                        {variants.length > 0 && (
                            <ul className={styles.variantList}>
                                {variants.map(v => (
                                    <li key={v.id}>{v.color?.name} / {v.size?.name} — stock: {v.stock}</li>
                                ))}
                            </ul>
                        )}
                        <div className={styles.stepDivider} />

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

                            <ul className={styles.checklist}>
                            <li className={variants.length > 0 ? styles.checkOk : styles.checkMissing}>
                                {variants.length > 0 ? '✓' : '✕'} {variants.length} variante(s) cargada(s)
                            </li>
                            <li className={images.length > 0 ? styles.checkOk : styles.checkMissing}>
                                {images.length > 0 ? '✓' : '✕'} {images.length} imagen(es) cargada(s)
                            </li>
                        </ul>

                        {(variants.length === 0 || images.length === 0) && (
                            <p className={styles.hintText}>
                                ⚠️ Faltan datos: el producto se publicará igual, pero podría no verse bien en la tienda.
                            </p>
                        )}

                            <button className={styles.saveBtn} onClick={handleFinish}>
                                Finalizar y publicar
                            </button>
                        </section>
                    )}
                </div>
                </div>
            <Toast toast={toast} onHide={hideToast} />
        </div>
    )
}

export default NewProductsForm