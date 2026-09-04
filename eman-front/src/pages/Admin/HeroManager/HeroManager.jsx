import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Trash2, Eye, EyeOff, Plus, Target } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useToast } from '../../../hooks/useToast'
import Toast from '../../../components/Toast/Toast'
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal'
import { useFetchOnMount } from '../../../hooks/useFetchOnMount'
import styles from './HeroManager.module.css'

const emptyForm = {
    tag: '',
    title: '',
    subtitle: '',
    ctaText: '',
    ctaUrl: '',
    order: 0,
}

const HeroManager = () => {
    const navigate = useNavigate()
    const { toast, showToast, hideToast } = useToast()

    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)

    // form de creación
    const [newForm, setNewForm] = useState(emptyForm)
    const [newFile, setNewFile] = useState(null)
    const [creating, setCreating] = useState(false)

    // edición inline por slide
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState(emptyForm)
    const [savingId, setSavingId] = useState(null)

    const [replacingId, setReplacingId] = useState(null)
    const [togglingId, setTogglingId] = useState(null)
    const [slideToDelete, setSlideToDelete] = useState(null)

    // focal point
    const [settingFocusId, setSettingFocusId] = useState(null)

    const fetchSlides = async (signal) => {
        try {
            const res = await axiosInstance.get('/media_content', {signal})
            const heroSlides = res.data
                .filter(m => m.type === 'hero')
                .sort((a, b) => a.order - b.order)
            setSlides(heroSlides)
        } catch (err) {
            if (err.name !== 'CanceledError') {
            showToast('Error al cargar los slides', 'error')
        }
            throw err
        } finally {
            setLoading(false)
        }
    }

    useFetchOnMount(fetchSlides)

    // ---------- Crear ----------
    const handleNewFormChange = (e) => {
        const { name, value } = e.target
        setNewForm(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = async () => {
        if (!newFile) {
            showToast('Elegí una imagen', 'error')
            return
        }
        setCreating(true)
        try {
            const formData = new FormData()
            formData.append('file', newFile)
            formData.append('type', 'hero')
            formData.append('section', 'home')
            Object.entries(newForm).forEach(([key, value]) => {
                if (value !== '') formData.append(key, value)
            })

            await axiosInstance.post('/media_content', formData)
            showToast('Slide creado correctamente')
            setNewForm(emptyForm)
            setNewFile(null)
            fetchSlides()
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al crear el slide', 'error')
        } finally {
            setCreating(false)
        }
    }

    // ---------- Editar texto ----------
    const startEditing = (slide) => {
        setEditingId(slide.id)
        setEditForm({
            tag: slide.tag || '',
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            ctaText: slide.ctaText || '',
            ctaUrl: slide.ctaUrl || '',
            order: slide.order ?? 0,
            focalPoint: slide.focalPoint || 'center center',
        })
    }

    const handleEditFormChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSaveEdit = async (id) => {
        setSavingId(id)
        try {
            const { focalPoint, ...textFields } = editForm
            
            const formData = new FormData()
            Object.entries(textFields).forEach(([key, value]) => {
                formData.append(key, value)
            })
            await axiosInstance.patch(`/media_content/${id}`, formData)
            //foco aparte porque tiene su propio endpoint
            await axiosInstance.patch(`/media_content/${id}/focal-point`, { focalPoint })

            showToast('Slide actualizado')
            setEditingId(null)
            fetchSlides()
        } catch (err) {
            console.error(err)
            showToast('Error al actualizar', 'error')
        } finally {
            setSavingId(null)
        }
    }

    // ---------- Reemplazar imagen ----------
    const handleReplaceImage = async (id, e) => {
        const file = e.target.files[0]
        if (!file) return
        setReplacingId(id)
        try {
            const formData = new FormData()
            formData.append('file', file)
            await axiosInstance.patch(`/media_content/${id}`, formData)
            showToast('Imagen reemplazada — recordá reajustar el punto de foco')
            fetchSlides()
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al reemplazar la imagen', 'error')
        } finally {
            setReplacingId(null)
            e.target.value = ''
        }
    }

    // ---------- Focal point (click-to-set) ----------
    const handleImageClick = async (e, slide) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(0)
        const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(0)
        const focalPoint = `${x}% ${y}%`

        setSettingFocusId(slide.id)
        try {
            await axiosInstance.patch(`/media_content/${slide.id}/focal-point`, { focalPoint })
            setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, focalPoint } : s))
        } catch (err) {
            console.error(err)
            showToast('Error al guardar el punto de foco', 'error')
        } finally {
            setSettingFocusId(null)
        }
    }

    // ---------- Toggle / eliminar ----------
    const handleToggle = async (id) => {
        setTogglingId(id)
        try {
            const res = await axiosInstance.patch(`/media_content/${id}/toggle`)
            setSlides(prev => prev.map(s => s.id === id ? res.data : s))
        } catch (err) {
            console.error(err)
            showToast('Error al cambiar el estado', 'error')
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async () => {
        if (!slideToDelete) return
        try {
            await axiosInstance.delete(`/media_content/${slideToDelete.id}`)
            showToast('Slide eliminado')
            setSlides(prev => prev.filter(s => s.id !== slideToDelete.id))
        } catch (err) {
            console.error(err)
            showToast('Error al eliminar el slide', 'error')
        } finally {
            setSlideToDelete(null)
        }
    }

    if (loading) return <div className={styles.page}>Cargando...</div>

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/admin')}>
                    <ArrowLeft size={16} strokeWidth={1.5} />
                    Volver al panel
                </button>
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>Gestión del Hero</h1>
                <p className={styles.subtitle}>Carrusel principal del home — imágenes, texto y punto de foco</p>
            </div>

            {/* Slides existentes */}
            <div className={styles.slidesGrid}>
                {slides.map(slide => (
                    <div key={slide.id} className={`${styles.slideCard} ${!slide.isActive ? styles.slideCardInactive : ''}`}>
                        <div
                            className={styles.imagePreview}
                            onClick={(e) => editingId !== slide.id && handleImageClick(e, slide)}
                            title="Click para marcar el punto de foco"
                        >
                            <img
                                src={slide.url}
                                alt={slide.altText || slide.title}
                                style={{ objectPosition: slide.focalPoint || 'center center' }}
                            />
                            {settingFocusId === slide.id && (
                                <div className={styles.imageOverlay}>Guardando foco...</div>
                            )}
                            <div className={styles.focalHint}>
                                <Target size={12} strokeWidth={1.5} />
                                {slide.focalPoint || 'center center'}
                            </div>
                        </div>

                        <div className={styles.imageActions}>
                            <label className={styles.imageBtn} title="Reemplazar imagen">
                                <Upload size={14} strokeWidth={1.5} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={styles.fileInputHidden}
                                    onChange={(e) => handleReplaceImage(slide.id, e)}
                                    disabled={replacingId === slide.id}
                                />
                            </label>
                            <button
                                className={styles.imageBtn}
                                onClick={() => handleToggle(slide.id)}
                                disabled={togglingId === slide.id}
                                title={slide.isActive ? 'Desactivar' : 'Activar'}
                            >
                                {slide.isActive ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                            </button>
                            <button
                                className={`${styles.imageBtn} ${styles.imageBtnDelete}`}
                                onClick={() => setSlideToDelete(slide)}
                                title="Eliminar slide"
                            >
                                <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                        </div>

                        {editingId === slide.id ? (
                            <div className={styles.editForm}>
                                <div className={styles.field}>
                            <label className={styles.label}>TAG</label>
                            <input className={styles.input} name="tag" placeholder="Tag" value={editForm.tag} onChange={handleEditFormChange} />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>TÍTULO</label>
                            <input className={styles.input} name="title" placeholder="Título" value={editForm.title} onChange={handleEditFormChange} />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>SUBTÍTULO</label>
                            <input className={styles.input} name="subtitle" placeholder="Subtítulo" value={editForm.subtitle} onChange={handleEditFormChange} />
                        </div>
                                <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>TEXTO BOTÓN</label>
                                <input className={styles.input} name="ctaText" placeholder="Texto botón" value={editForm.ctaText} onChange={handleEditFormChange} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>URL BOTÓN</label>
                                <input className={styles.input} name="ctaUrl" placeholder="URL botón" value={editForm.ctaUrl} onChange={handleEditFormChange} />
                            </div>
                        </div>
                            <div className={styles.field}>
                                <label className={styles.label}>ORDEN (posición en el carrusel, empieza en 0)</label>
                                <input className={styles.input} name="order" type="number" placeholder="Orden" value={editForm.order} onChange={handleEditFormChange} />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>PUNTO DE FOCO (o click en la imagen de arriba)</label>
                                <input
                                    className={styles.input}
                                    name="focalPoint"
                                    placeholder="ej: center 15%"
                                    value={editForm.focalPoint}
                                    onChange={handleEditFormChange}
                                />
                            </div>
                                <div className={styles.row}>
                                    <button className={styles.saveBtn} onClick={() => handleSaveEdit(slide.id)} disabled={savingId === slide.id}>
                                        {savingId === slide.id ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.slideInfo} onClick={() => startEditing(slide)}>
                                <p className={styles.slideTag}>{slide.tag || '— sin tag —'}</p>
                                <p className={styles.slideTitle}>{slide.title || '— sin título —'}</p>
                                <p className={styles.slideSubtitle}>{slide.subtitle || '— sin subtítulo —'}</p>
                                <p className={styles.slideMeta}>orden: {slide.order} · {slide.ctaText || 'sin CTA'} → {slide.ctaUrl || '—'}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Form de nuevo slide */}
            <section className={styles.card}>
                <p className={styles.sectionLabel}>Agregar nuevo slide</p>

                <label className={styles.uploadArea}>
                    {newFile ? (
                        <img src={URL.createObjectURL(newFile)} alt="preview" className={styles.uploadPreview} />
                    ) : (
                        <>
                            <Upload size={20} strokeWidth={1.5} color="#aaa" />
                            <span>Elegir imagen</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInputHidden}
                        onChange={(e) => setNewFile(e.target.files[0])}
                    />
                </label>

                <div className={styles.field}>
                    <label className={styles.label}>TAG</label>
                    <input className={styles.input} name="tag" value={newForm.tag} onChange={handleNewFormChange} />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>TÍTULO</label>
                    <input className={styles.input} name="title" value={newForm.title} onChange={handleNewFormChange} />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>SUBTÍTULO</label>
                    <input className={styles.input} name="subtitle" value={newForm.subtitle} onChange={handleNewFormChange} />
                </div>
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>TEXTO BOTÓN</label>
                        <input className={styles.input} name="ctaText" value={newForm.ctaText} onChange={handleNewFormChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>URL BOTÓN</label>
                        <input className={styles.input} name="ctaUrl" value={newForm.ctaUrl} onChange={handleNewFormChange} />
                    </div>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>ORDEN</label>
                    <input className={styles.input} name="order" type="number" value={newForm.order} onChange={handleNewFormChange} />
                </div>

                <button className={styles.saveBtn} onClick={handleCreate} disabled={creating}>
                    <Plus size={14} strokeWidth={2} />
                    {creating ? 'Creando...' : 'Crear slide'}
                </button>
            </section>

            <ConfirmModal
                isOpen={!!slideToDelete}
                title="Eliminar slide"
                message={slideToDelete ? `¿Eliminar el slide "${slideToDelete.title || 'sin título'}"? Esta acción no se puede deshacer.` : ''}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setSlideToDelete(null)}
            />
            <Toast toast={toast} onHide={hideToast} />
        </div>
    )
}

export default HeroManager