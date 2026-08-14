import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartReducer'
import { selectCartTotal } from '../../redux/slices/cartReducer'
import { sanitizeName, sanitizePhone, sanitizeAddress, sanitizeZipCode, validateName, validateEmail, validatePhone, validateAddress, validateCity, validateZipCode, validateLocality, validateStep1, validateStep2 } from '../../utils/checkoutValidation'
import Toast from '../../components/Toast/Toast'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import Stepper from '../Stepper/Stepper'
import styles from './Checkout.module.css'
import axiosInstance from '../../api/axiosInstance'
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
    const user     = useSelector(state => state.auth.user) 
    const isAuthenticated = !!user


    const [orderId, setOrderId] = useState(null)
    const [preferenceId, setPreferenceId] = useState(null)

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [touched, setTouched] = useState({})

    const [shippingQuote, setShippingQuote] = useState(null) // { price, deliveryTimeMin, deliveryTimeMax }
    const [quotingShipping, setQuotingShipping] = useState(false)
    const [shippingQuoteError, setShippingQuoteError] = useState(null)

    const hideToast = () => setToast(null)

    const [step, setStep] = useState(1)

    const [form, setForm] = useState({
        // Paso 1
        guestName:  user?.name  || '',
        guestEmail: user?.email || '',
        guestPhone: user?.phone || '',
        // Paso 2
        address:  user?.address  || '',
        city:     user?.city     || '',
        zipCode:      '',
        shippingType: 'correo_argentino',
        locality: ''
    })


const handleChange = (e) => {
    const { name, value } = e.target
    const sanitizer = fieldSanitizers[name]
    const cleanValue = sanitizer ? sanitizer(value) : value

    setForm({ ...form, [name]: cleanValue })

    // Invalidamos la cotización anterior apenas cambia el CP
    if (name === 'zipCode') {
        setShippingQuote(null)
        setShippingQuoteError(null)
    }

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

    // Nuevo: limpiamos la cotización previa al cambiar el tipo de envío
    setShippingQuote(null)
    setShippingQuoteError(null)
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
    if (form.shippingType === 'correo_argentino') {
        if (quotingShipping) {
            setToast({ type: 'error', message: 'Aguardá un instante a que se calcule el costo de envío.' })
            return
        }
        if (!shippingQuote) {
            setToast({ type: 'error', message: 'No pudimos calcular el envío para ese código postal. Verificalo o elegí otra opción de entrega.' })
            return
        }
    }

    setStep(s => s + 1)
        return
    }

    if (step === 3) {
        setLoading(true)
    try {
        const orderRes = await axiosInstance.post(`/order`,
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
const prefRes = await axiosInstance.post(`/payments/create-preference`,{
            orderId:      order.id,
            shippingCost,
        })
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
    if (step === 4) {
        setStep(s => s + 1)
        return
    }
    
}

const handleBack = () => setStep(s => s - 1)


useEffect(() => {
  // Solo cotizamos si eligieron Correo Argentino y el CP tiene 4 dígitos (formato AR)
    const isValidZip = form.shippingType === 'correo_argentino' && /^\d{4}$/.test(form.zipCode)

    if (!isValidZip) {
        return // no reseteamos nada acá — eso ya lo hacen los handlers
    }

    const timer = setTimeout(async () => {
        setQuotingShipping(true)
        setShippingQuoteError(null)

        try {
        const { data } = await axiosInstance.post('/shipping/quote', {
            postalCodeDestination: form.zipCode,
            weight: 1000,   // TODO: calcular a partir del carrito cuando tengas peso por producto
            height: 20,
            width: 20,
            length: 30,
        })

        const domicilio = data.find(r => r.deliveredType === 'D')

        if (domicilio) {
            setShippingQuote({
            price: domicilio.price,
            deliveryTimeMin: domicilio.deliveryTimeMin,
            deliveryTimeMax: domicilio.deliveryTimeMax,
            })
        } else {
            setShippingQuote(null)
            setShippingQuoteError('No pudimos cotizar el envío para ese código postal.')
        }
        } catch (err) {
        console.error('Error cotizando envío:', err)
        setShippingQuote(null)
        setShippingQuoteError('No pudimos cotizar el envío. Probá de nuevo.')
        } finally {
        setQuotingShipping(false)
        }
    }, 600) // debounce: espera 600ms sin cambios en el CP antes de cotizar

    return () => clearTimeout(timer) // cancela la cotización anterior si el usuario sigue tipeando
}, [form.zipCode, form.shippingType])


const shippingCost = form.shippingType === 'correo_argentino'
    ? (shippingQuote?.price ?? 0)
    : 0 // coordinado y retiro en local ya son gratis

if (items.length === 0 && step < 4) {
    return (
        <div className={styles.empty}>
            <p>Tu carrito está vacío</p>
            <button className={styles.emptyBtn} onClick={() => navigate('/tienda')}>
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
                {isAuthenticated && form.guestEmail === user?.email && (
                    <span className={styles.readonlyHint}>
                        Este es el email de tu cuenta. Si comprás para otra persona, podés cambiarlo.
                    </span>
                )}
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

            <button className={styles.nextBtn} onClick={handleNext} >
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
                    <p className={styles.shippingDesc}>Todo el país</p>
                    </div>
                <span className={styles.shippingPrice}>
                    {form.shippingType === 'correo_argentino' && form.zipCode.length === 4
                        ? quotingShipping
                        ? 'Calculando...'
                        : shippingQuote
                            ? `$${shippingQuote.price.toLocaleString('es-AR')}`
                            : 'No disponible'
                        : 'A calcular'}
                    </span>
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
                            placeholder="Ej: 2255"
                        />
                    {errors.zipCode && <span className={styles.error}>{errors.zipCode}</span>}
                    {quotingShipping && <span className={styles.readonlyHint}>Calculando envío...</span>}
                    {shippingQuote && !quotingShipping && (
                        <span className={styles.readonlyHint}>
                            Llega en {shippingQuote.deliveryTimeMin} a {shippingQuote.deliveryTimeMax} días hábiles
                        </span>
                    )}
                    {shippingQuoteError && <span className={styles.error}>{shippingQuoteError}</span>}
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


        {/* ── Paso 3: Resumen ── */}
{step === 3 && (
    <div className={styles.form}>
        <h2 className={styles.stepTitle}>Resumen de tu compra</h2>

        <div className={styles.summaryItems}>
            {items.map(item => (
                <div key={item.variantId} className={styles.summaryItem}>
                    <span>{item.name} · {item.color} · Talle {item.size} · x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
            ))}
        </div>
        <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <div className={styles.summaryRow}>
            <span>Envío ({form.shippingType === 'correo_argentino' ? 'Correo Argentino' : form.shippingType === 'coordinado' ? 'Coordinado' : 'Retiro en local'})</span>
            <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-AR')}`}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span>${(total + shippingCost).toLocaleString('es-AR')}</span>
        </div>

        <div className={styles.btnRow}>
            <button className={styles.backBtn} onClick={handleBack}>Volver</button>
            <button className={styles.nextBtn} onClick={handleNext} disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar y pagar'}
            </button>
        </div>
    </div>
)}


        {/* ── Paso 4: Pago ── */}
            {step === 4 && (
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
                                    const { data } = await axiosInstance.post(
                                        `/payments/process-payment`,
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