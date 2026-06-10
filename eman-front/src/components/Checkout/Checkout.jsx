import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/cartReducer'
import { selectCartTotal } from '../../redux/cartReducer'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import styles from './Checkout.module.css'

const STEPS = ['Datos personales', 'Envío', 'Resumen']


const Checkout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const items    = useSelector(state => state.cart.items)
    const total    = useSelector(selectCartTotal)

    const [step, setStep] = useState(1)

    const [form, setForm] = useState({
        // Paso 1
        guestName:  '',
        guestEmail: '',
        guestPhone: '',
        // Paso 2
        address:      '',
        city:         '',
        zipCode:      '',
        shippingType: 'correo_argentino',
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setErrors({ ...errors, [e.target.name]: '' })
    }

    const validateStep1 = () => {
        const e = {}
        if (!form.guestName.trim())  e.guestName  = 'El nombre es requerido'
        if (!form.guestEmail.trim()) e.guestEmail = 'El email es requerido'
        if (!/\S+@\S+\.\S+/.test(form.guestEmail)) e.guestEmail = 'Email inválido'
        if (!form.guestPhone.trim()) e.guestPhone = 'El teléfono es requerido'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const validateStep2 = () => {
        const e = {}
        if (!form.address.trim()) e.address = 'La dirección es requerida'
        if (!form.city.trim())    e.city    = 'La ciudad es requerida'
        if (!form.zipCode.trim()) e.zipCode = 'El código postal es requerido'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return
        if (step === 2 && !validateStep2()) return
        setStep(s => s + 1)
    }

    const handleBack = () => setStep(s => s - 1)

    const shippingCost = form.shippingType === 'coordinado' ? 0 : 0 // TODO: API Correo Argentino, reemplaza con credenciales

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const body = {
                guestName:    form.guestName,
                guestEmail:   form.guestEmail,
                guestPhone:   form.guestPhone,
                address:      form.address,
                city:         form.city,
                zipCode:      form.zipCode,
                shippingType: form.shippingType,
                shippingCost,
                items: items.map(item => ({
                    productId:   item.id,
                    variantId:   item.variant?.id ?? item.id,
                    productName: item.name,
                    quantity:    item.quantity,
                    unitPrice:   Number(item.price),
                }))
            }

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    })

    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al crear la orden')
    }

    dispatch(clearCart())
    navigate('/orden-confirmada')

    } catch (err) {
        setErrors({ submit: err.message })
    } finally {
        setLoading(false)
    }
}

    if (items.length === 0 && step !== 3) {
            return (
                <div className={styles.empty}>
                    <p>Tu carrito está vacío</p>
                    <button onClick={() => navigate('/')}>Ver productos</button>
                </div>
            )
        }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Checkout' },
            ]} />

            {/* Indicador de pasos */}
            <div className={styles.stepper}>
                {STEPS.map((label, i) => (
                    <div key={i} className={styles.stepItem}>
                        <div className={`${styles.stepCircle} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
                            {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className={`${styles.stepLabel} ${step === i + 1 ? styles.stepLabelActive : ''}`}>
                            {label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div className={`${styles.stepLine} ${step > i + 1 ? styles.stepLineDone : ''}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.content}>
                {/* ── Paso 1: Datos personales ── */}
                {step === 1 && (
                    <div className={styles.form}>
                        <h2 className={styles.stepTitle}>Datos personales</h2>

                        <div className={styles.field}>
                            <label className={styles.label}>Nombre y apellido</label>
                            <input
                                className={`${styles.input} ${errors.guestName ? styles.inputError : ''}`}
                                name="guestName"
                                value={form.guestName}
                                onChange={handleChange}
                                placeholder="Ej: Juan Perez"
                            />
                            {errors.guestName && <span className={styles.error}>{errors.guestName}</span>}
                        </div>

            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                    <input
                        className={`${styles.input} ${errors.guestEmail ? styles.inputError : ''}`}
                        name="guestEmail"
                        type="email"
                        value={form.guestEmail}
                        onChange={handleChange}
                        placeholder="Ej: juan@gmail.com"
                    />
                {errors.guestEmail && <span className={styles.error}>{errors.guestEmail}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                    <input
                        className={`${styles.input} ${errors.guestPhone ? styles.inputError : ''}`}
                        name="guestPhone"
                        value={form.guestPhone}
                        onChange={handleChange}
                        placeholder="Ej: 3404123456"
                    />
                {errors.guestPhone && <span className={styles.error}>{errors.guestPhone}</span>}
            </div>

            <button className={styles.nextBtn} onClick={handleNext}>
                Continuar
            </button>
        </div>
        )}

        {/* ── Paso 2: Envío ── */}
        {step === 2 && (
            <div className={styles.form}>
                <h2 className={styles.stepTitle}>Datos de envío</h2>

            <div className={styles.field}>
                <label className={styles.label}>Dirección</label>
                    <input
                        className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Ej: San Martín 123"
                    />
                {errors.address && <span className={styles.error}>{errors.address}</span>}
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Ciudad</label>
                        <input
                            className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Ej: Galvez"
                        />
                    {errors.city && <span className={styles.error}>{errors.city}</span>}
                </div>

            <div className={styles.field}>
                    <label className={styles.label}>Código postal</label>
                        <input
                            className={`${styles.input} ${errors.zipCode ? styles.inputError : ''}`}
                            name="zipCode"
                            value={form.zipCode}
                            onChange={handleChange}
                            placeholder="Ej: 2538"
                        />
                    {errors.zipCode && <span className={styles.error}>{errors.zipCode}</span>}
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Tipo de envío</label>
                    <div className={styles.shippingOptions}>
                        <label className={`${styles.shippingOption} ${form.shippingType === 'correo_argentino' ? styles.shippingOptionActive : ''}`}>
                            <input
                                type="radio"
                                    name="shippingType"
                                    value="correo_argentino"
                                    checked={form.shippingType === 'correo_argentino'}
                                    onChange={handleChange}
                            />
                    <div>
                    <p className={styles.shippingName}>Correo Argentino</p>
                    <p className={styles.shippingDesc}>Todo el país — 2 a 5 días hábiles</p>
                    </div>
                <span className={styles.shippingPrice}>A calcular</span>
            </label>

            <label className={`${styles.shippingOption} ${form.shippingType === 'coordinado' ? styles.shippingOptionActive : ''}`}>
                    <input
                        type="radio"
                            name="shippingType"
                            value="coordinado"
                            checked={form.shippingType === 'coordinado'}
                            onChange={handleChange}
                        />
                    <div>
                <p className={styles.shippingName}>Coordinado</p>
                <p className={styles.shippingDesc}>Galvez, Belgrano, Santa Clara — Por WhatsApp</p>
            </div>
            <span className={styles.shippingPrice}>Gratis</span>
            </label>
            </div>
        </div>

        <div className={styles.btnRow}>
                <button className={styles.backBtn} onClick={handleBack}>Volver</button>
                <button className={styles.nextBtn} onClick={handleNext}>Continuar</button>
            </div>
            </div>
        )}

        {/* ── Paso 3: Resumen ── */}
        {step === 3 && (
            <div className={styles.form}>
            <h2 className={styles.stepTitle}>Resumen del pedido</h2>

            <div className={styles.summary}>
                {items.map((item, i) => (
                    <div key={i} className={styles.summaryItem}>
                        <img src={item.image} alt={item.name} className={styles.summaryImg} />
                            <div className={styles.summaryInfo}>
                            <p className={styles.summaryName}>{item.name}</p>
                            <p className={styles.summaryMeta}>{item.color?.name} · Talle {item.size} · x{item.quantity}</p>
                        </div>
                    <span className={styles.summaryPrice}>
                    ${Number(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                </div>
            ))}
        </div>

        <div className={styles.totals}>
            <div className={styles.totalRow}>
            <span>Subtotal</span>
        <span>${Number(total).toLocaleString('es-AR')}</span>
        </div>
        <div className={styles.totalRow}>
            <span>Envío</span>
        <span>{shippingCost === 0 ? 'Gratis' : `$${Number(shippingCost).toLocaleString('es-AR')}`}</span>
        </div>
        <hr className={styles.divider} />
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                <span>Total</span>
        <span>${Number(total + shippingCost).toLocaleString('es-AR')}</span>
            </div>
        </div>

        {errors.submit && (
            <p className={styles.errorSubmit}>{errors.submit}</p>
        )}

        <div className={styles.btnRow}>
            <button className={styles.backBtn} onClick={handleBack}>Volver</button>
                <button
                    className={styles.confirmBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                {loading ? 'Procesando...' : 'Confirmar pedido'}
                </button>
                </div>
            </div>
        )}
            </div>
        </div>
    )

}

export default Checkout