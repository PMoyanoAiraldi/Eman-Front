import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartReducer'
import { selectCartTotal } from '../../redux/slices/cartReducer'
import { sanitizeName, sanitizePhone, sanitizeAddress, sanitizeZipCode, validateName, validateEmail, validatePhone, validateAddress, validateCity, validateZipCode, validateLocality, validateStep1, validateStep2 } from '../../utils/checkoutValidation'
import Toast from '../../components/Toast/Toast'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import Stepper from '../Stepper/Stepper'
import styles from './Checkout.module.css'
import axios from 'axios'
import { Payment } from '@mercadopago/sdk-react'


    const fieldValidators = {
        guestName:  validateName,
        guestEmail: validateEmail,
        guestPhone: validatePhone,
        address:    validateAddress,
        city:       validateCity,
        zipCode:    validateZipCode,
        locality:   validateLocality,
    }

    const fieldSanitizers = {
        guestName:  sanitizeName,
        guestPhone: sanitizePhone,
        address:    sanitizeAddress,
        zipCode:    sanitizeZipCode,
}

const Checkout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const items    = useSelector(state => state.cart.items)
    const total    = useSelector(selectCartTotal)

    const [orderId, setOrderId] = useState(null)
    const [preferenceId, setPreferenceId] = useState(null)

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [touched, setTouched] = useState({})

    const hideToast = () => setToast(null)

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
        locality: ''
    })


const handleChange = (e) => {
    const { name, value } = e.target
    const sanitizer = fieldSanitizers[name]
    const cleanValue = sanitizer ? sanitizer(value) : value

    setForm({ ...form, [name]: cleanValue })

    const validator = fieldValidators[name]
    if (validator && touched[name]) {
        setErrors({ ...errors, [name]: validator(cleanValue) })
    } else if (!validator){
        // paso 2: comportamiento simple, borra el error apenas se edita
        setErrors({ ...errors, [name]: '' })
    }
}

const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched({ ...touched, [name]: true })

    const validator = fieldValidators[name]
    if (validator) {
        setErrors({ ...errors, [name]: validator(value) })
    }
}

const handleShippingTypeChange = (e) => {
    const { value } = e.target
    setForm({
        ...form,
        shippingType: value,
        address:  '',
        city:     '',
        zipCode:  '',
        locality: '',
    })
    setErrors({ ...errors, address: '', city: '', zipCode: '', locality: '' })
    setTouched({ ...touched, address: false, city: false, zipCode: false, locality: false })
}

const handleNext = async () => {
    if (step === 1) {
        const stepErrors = validateStep1(form)
        setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
        setTouched({ guestName: true, guestEmail: true, guestPhone: true })
        return
    }
    setStep(s => s + 1)
    return
}

    if (step === 2){
        const stepErrors = validateStep2(form)
        console.log('stepErrors:', stepErrors)
        setErrors(stepErrors)
        if (Object.keys(stepErrors).length > 0) {
        setTouched({ ...touched, address: true, city: true, zipCode: true, locality: true })
        return
    }
        setLoading(true)
    try {
        const orderRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/order`,
            {
                guestName:    form.guestName,
                guestEmail:   form.guestEmail,
                guestPhone:   form.guestPhone,
                address:      form.address || 'Retiro en local',
                city:         form.city || form.locality || 'Gálvez',
                zipCode:      form.shippingType === 'correo_argentino' ? form.zipCode : undefined,
                shippingType: form.shippingType === 'retiro' ? 'retiro_en_local' : form.shippingType,
                shippingCost,
                items: items.map(item => ({
                    productId:   item.id,
                    variantId:   item.variantId,
                    productName: item.name,
                    quantity:    item.quantity,
                    unitPrice:   Number(item.price),
                }))
                }
            )
        const order = orderRes.data
        setOrderId(order.id)

// 2. Crear preferencia de MercadoPago
const prefRes = await axios.post(
    `${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/payments/create-preference`,
        {
            orderId:      order.id,
            shippingCost,
        }
    )
    setPreferenceId(prefRes.data.preferenceId)
    setStep(s => s + 1)

    } catch (err) {
        console.error('Error completo:', err.response?.data || err.message)
    setToast({
        type: 'error',
            message: err.response?.data?.message || err.message || 'Error al procesar',
    })
    } finally {
        setLoading(false)
    }
        return
    }
    
    if (step === 3) {
        setStep(s => s + 1)
        return
    }
    
}

const handleBack = () => setStep(s => s - 1)

const shippingCost = form.shippingType === 'coordinado' ? 0 : 0 // TODO: API Correo Argentino, reemplaza con credenciales

if (items.length === 0 && step < 3) {
    return (
        <div className={styles.empty}>
            <p>Tu carrito está vacío</p>
            <button className={styles.emptyBtn} onClick={() => navigate('/')}>
                Ver productos
            </button>

            <div className={styles.emptyCategories}>
                <span className={styles.emptyCategoriesLabel}>¿Qué estás buscando?</span>
                <div className={styles.emptyCategoriesRow}>
                    <button onClick={() => navigate('/mujer')}>Mujer</button>
                    <button onClick={() => navigate('/hombre')}>Hombre</button>
                    <button onClick={() => navigate('/deportivo')}>Deportivo</button>
                </div>
            </div>
        </div>
    )
}

return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Checkout' },
            ]} />

            <Stepper currentStep={step} />
            
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
                                onBlur={handleBlur}
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
                        onBlur={handleBlur}
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
                        onBlur={handleBlur}
                        placeholder="Ej: 1123456789 (sin 0 ni 15)"
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
                <label className={styles.label}>Tipo de envío</label>
                    <div className={styles.shippingOptions}>
                        <label className={`${styles.shippingOption} ${form.shippingType === 'correo_argentino' ? styles.shippingOptionActive : ''}`}>
                            <input
                                type="radio"
                                    name="shippingType"
                                    value="correo_argentino"
                                    checked={form.shippingType === 'correo_argentino'}
                                    onChange={handleShippingTypeChange}
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
                            onChange={handleShippingTypeChange}
                        />
                    <div>
                <p className={styles.shippingName}>Coordinado</p>
                <p className={styles.shippingDesc}>Gálvez, Belgrano — Por WhatsApp</p>
            </div>
            <span className={styles.shippingPrice}>Gratis</span>
            </label>
            <label className={`${styles.shippingOption} ${form.shippingType === 'retiro' ? styles.shippingOptionActive : ''}`}>
                    <input type="radio" name="shippingType" value="retiro" checked={form.shippingType === 'retiro'} onChange={handleShippingTypeChange} />
                    <div>
                        <p className={styles.shippingName}>Retiro en local</p>
                        <p className={styles.shippingDesc}>Entre Ríos 1529 — Lun a Sáb 10 a 12hs y 17 a 20hs</p>
                    </div>
                    <span className={styles.shippingPrice}>Gratis</span>
                </label>
            </div>
        </div>

    {/* Correo Argentino → dirección completa */}
        {form.shippingType === 'correo_argentino' && (
            <>
        <div className={styles.field}>
                <label className={styles.label}>Dirección</label>
                    <input
                        className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                            onBlur={handleBlur}
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
                            onBlur={handleBlur}
                            placeholder="Ej: 2538"
                        />
                    {errors.zipCode && <span className={styles.error}>{errors.zipCode}</span>}
                </div>
            </div>
            </>
        )}

        {/* Coordinado → select de localidad + dirección */}
        {form.shippingType === 'coordinado' && (
            <>
                <div className={styles.field}>
                    <label className={styles.label}>Localidad</label>
                    <select
                        className={`${styles.input} ${errors.locality ? styles.inputError : ''}`}
                        name="locality"
                        value={form.locality}
                        onChange={handleChange}
                    >
                        <option value="">Seleccioná tu localidad</option>
                        <option value="Galvez">Gálvez</option>
                        <option value="Belgrano">Belgrano</option>
                    </select>
                    {errors.locality && <span className={styles.error}>{errors.locality}</span>}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Dirección</label>
                    <input
                        className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ej: San Martín 123"
                    />
                    {errors.address && <span className={styles.error}>{errors.address}</span>}
                </div>
            </>
        )}

        {/* Retiro en local → info del local */}
        {form.shippingType === 'retiro' && (
            <div className={styles.localInfo}>
                <p className={styles.localInfoTitle}>Información del local</p>
                <p className={styles.localInfoText}>Entre Ríos 1529, López, Santa Fe</p>
                <p className={styles.localInfoText}>Lunes a Sábado: 10 a 12hs y 17 a 20hs</p>
                <a
                    href="https://maps.google.com/?q=Entre+Rios+1529+López+Santa+Fe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapsLink}
                >
                    Ver en Google Maps
                </a>
            </div>
        )}

        <div className={styles.btnRow}>
                <button className={styles.backBtn} onClick={handleBack}>Volver</button>
                <button className={styles.nextBtn} onClick={handleNext}>Continuar</button>
            </div>
            </div>
        )}

        {/* ── Paso 3: Pago ── */}
            {step === 3 && (
                <div className={styles.form}>
                
                    {preferenceId && (
                        <Payment
                            initialization={{
                                amount: total + shippingCost,
                                preferenceId,
                            }}
                            customization={{
                                visual: {
                                style: {
                                    theme: 'default', // o 'flat' / 'bootstrap' / 'dark'
                                    customVariables: {
                                        baseColor: '#C9A84C',              // color principal (botón, focus, etc.)
                                        baseColorFirstVariant: '#B8973E',  // hover/variante más oscura
                                        baseColorSecondVariant: '#D9C27A', // variante más clara
                                        textPrimaryColor: '#2B2B2B',
                                        textSecondaryColor: '#6B6B6B',
                                        buttonTextColor: '#FFFFFF',
                                        inputBackgroundColor: '#FFFFFF',
                                        formBackgroundColor: '#FFFFFF',
                                        outlinePrimaryColor: '#C9A84C',
                                        borderRadiusSmall: '6px',
                                        borderRadiusMedium: '8px',
                                        borderRadiusLarge: '12px',
                                        formPadding: '12px',
                                    },
                                },
                            },
                                paymentMethods: {
                                    //ticket:          'all',
                                    bankTransfer:    'all',
                                    creditCard:      'all',
                                    debitCard:       'all',
                                    mercadoPago:     'all',
                                },
                            }}
                            onSubmit={async ({ formData }) => {
                                try {
                                    const { data } = await axios.post(
                                        `${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/payments/process-payment`,
                                        { formData, orderId }
                                    )

                                    if (data.status === 'approved') {
                                        dispatch(clearCart())
                                        navigate(`/order-confirm?orderId=${orderId}`)
                                    } else if (data.status === 'in_process') {
                                        navigate(`/order-pending?orderId=${orderId}`)
                                    } else {
                                        setToast({
                                            type: 'error',
                                            message: 'El pago fue rechazado. Probá con otro medio de pago.',
                                        })
                                    }
                                } catch (err) {
                                    setToast({
                                        type: 'error',
                                        message: err.response?.data?.message || 'Error al procesar el pago. Intentá de nuevo.',
                                    })
                                }
                            }}
                            onError={(error) => {
                                console.error('MP Error:', error)
                                setToast({
                                    type: 'error',
                                    message: 'Error en el pago. Intentá de nuevo.',
                                })
                            }}
                        />
                    )}

                    {errors.submit && <p className={styles.errorSubmit}>{errors.submit}</p>}

                    <button className={styles.backBtn} onClick={handleBack}>Volver</button>
                </div>
            )}

            </div>
            <Toast toast={toast} onHide={hideToast} />
        </div>
    )

}

export default Checkout