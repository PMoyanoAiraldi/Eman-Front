import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartReducer'
import { selectCartTotal } from '../../redux/slices/cartReducer'
import { sanitizeName, sanitizePhone, sanitizeZipCode, validateName, validateEmail, validatePhone, validateCity, validateZipCode, validateLocality, validateStep1, validateStep2 } from '../../utils/checkoutValidation'
import { sanitizeStreetName, sanitizeStreetNumber, validateStreetName, validateStreetNumber } from '../../utils/addressValidation'
import { PROVINCIAS_ARGENTINAS, validateProvince } from '../../utils/provinces'
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
        streetName:   validateStreetName,
        streetNumber: validateStreetNumber,
        city:       validateCity,
        zipCode:    validateZipCode,
        provinceCode: validateProvince,
        locality:   validateLocality,
    }

    const fieldSanitizers = {
        guestName:  sanitizeName,
        guestPhone: sanitizePhone,
        streetName:   sanitizeStreetName,
        treetNumber: sanitizeStreetNumber,
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

    const [agencies, setAgencies] = useState([])
    const [loadingAgencies, setLoadingAgencies] = useState(false)

    const [agencyFilter, setAgencyFilter] = useState('')
    

    const hideToast = () => setToast(null)

    const [step, setStep] = useState(1)

    const [form, setForm] = useState({
        // Paso 1
        guestName:  user?.name  || '',
        guestEmail: user?.email || '',
        guestPhone: user?.phone || '',
        // Paso 2
        streetName:   user?.streetName   || '',
        streetNumber: user?.streetNumber || '',
        floor:        user?.floor        || '',
        apartment:    user?.apartment    || '',
        city:         user?.city     || '',
        zipCode:      '',
        provinceCode: user?.provinceCode || '',
        shippingType: 'correo_argentino',
        locality: '',
        deliveryType: 'domicilio',
        agencyCode: '',
        agencyName: '',
        agencyAddress: '',
        agencyCity: '',
    })

    const agenciesRequestId = useRef(0)

    const fetchAgencies = async (provinceCode) => {
        const requestId = ++agenciesRequestId.current
        setLoadingAgencies(true)

        try {
            const { data } = await axiosInstance.get('/shipping/agencies', { params: { provinceCode } })
            if (requestId === agenciesRequestId.current) setAgencies(data)
        } catch {
            if (requestId === agenciesRequestId.current) setAgencies([])
        } finally {
            if (requestId === agenciesRequestId.current) setLoadingAgencies(false)
        }
    }

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

    if (name === 'provinceCode') {
        setAgencies([])
        setAgencyFilter('')
        if (form.deliveryType === 'sucursal' && cleanValue) {
            fetchAgencies(cleanValue)
        }
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
        deliveryType: 'domicilio',
        streetName:   '',
        streetNumber: '',
        floor:        '',
        apartment:    '',
        city:     '',
        zipCode:  '',
        provinceCode: '',
        locality: '',
        agencyCode: '', 
        agencyName: '', 
        agencyAddress: '', 
        agencyCity: '',
    })
    setErrors({ ...errors, streetName: '', streetNumber: '', city: '', zipCode: '', provinceCode: '', locality: '', agencyCode: '' })
    setTouched({ ...touched, streetName: false, streetNumber: false, city: false, zipCode: false, provinceCode: false, locality: false })

    // Limpiamos la cotización previa al cambiar el tipo de envío
    setShippingQuote(null)
    setShippingQuoteError(null)
    setAgencies([])
    setAgencyFilter('')
}

const handleDeliveryTypeChange = (value) => {
    setForm({
        ...form,
        deliveryType: value,
        agencyCode: '', 
        agencyName: '', 
        agencyAddress: '', 
        agencyCity: '',
        streetName: '', 
        streetNumber: '', 
        city: '', 
        zipCode: '',
    })
    setErrors({ ...errors, agencyCode: '', streetName: '', streetNumber: '', city: '', zipCode: '' })
    setShippingQuote(null)
    setShippingQuoteError(null)
    setAgencyFilter('')

    if (value === 'sucursal' && form.provinceCode) {
        fetchAgencies(form.provinceCode)
    } else {
        setAgencies([])
    }
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
                streetName:   form.shippingType !== 'retiro' ? form.streetName   : undefined,
                streetNumber: form.shippingType !== 'retiro' ? form.streetNumber : undefined,
                floor:        form.floor     || undefined,
                apartment:    form.apartment || undefined,
                deliveryType: form.shippingType === 'correo_argentino' ? form.deliveryType : undefined,
                agencyCode:    form.deliveryType === 'sucursal' ? form.agencyCode    : undefined,
                agencyName:    form.deliveryType === 'sucursal' ? form.agencyName    : undefined,
                agencyAddress: form.deliveryType === 'sucursal' ? form.agencyAddress : undefined,
                agencyCity:    form.deliveryType === 'sucursal' ? form.agencyCity    : undefined,
                city: form.deliveryType === 'sucursal' ? form.agencyCity : (form.city || form.locality || 'Gálvez'),
                provinceCode: form.shippingType === 'correo_argentino' ? form.provinceCode : undefined,
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

const handleAgencySelect = (e) => {
    const agency = agencies.find(a => a.code === e.target.value)
    if (!agency) return
    const fullPostalCode = agency.location.address.postalCode // ej: "S2151IPD"
    const numericZip = fullPostalCode.match(/\d{4}/)?.[0] ?? '' // extrae "2151"

    setForm({
        ...form,
        agencyCode: agency.code,
        agencyName: agency.name,
        agencyAddress: `${agency.location.address.streetName} ${agency.location.address.streetNumber}`,
        agencyCity: agency.location.address.city,
        zipCode: numericZip
    })
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
            deliveredType: form.deliveryType === 'sucursal' ? 'S' : 'D',
            items: items.map(item => ({
                productId: item.id,
                quantity:  item.quantity,
            })),
        })

        const domicilio = data.find(r => r.deliveredType === (form.deliveryType === 'sucursal' ? 'S' : 'D'))

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
}, [form.zipCode, form.shippingType, form.deliveryType])


const normalize = (str) => str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const filteredAgencies = agencies.filter(a =>
    normalize(a.location.address.city).includes(normalize(agencyFilter)) ||
    normalize(a.name).includes(normalize(agencyFilter))
)


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
            <label className={styles.label}>¿Cómo lo recibís?</label>
            <div className={styles.shippingOptions}>
                <label className={`${styles.shippingOption} ${form.deliveryType === 'domicilio' ? styles.shippingOptionActive : ''}`}>
                    <input type="radio" checked={form.deliveryType === 'domicilio'} onChange={() => handleDeliveryTypeChange('domicilio')} />
                    <div>
                        <p className={styles.shippingName}>Envío a domicilio</p>
                    </div>
                </label>
                <label className={`${styles.shippingOption} ${form.deliveryType === 'sucursal' ? styles.shippingOptionActive : ''}`}>
                    <input type="radio" checked={form.deliveryType === 'sucursal'} onChange={() => handleDeliveryTypeChange('sucursal')} />
                    <div>
                        <p className={styles.shippingName}>Retiro en sucursal de Correo</p>
                    </div>
                </label>
            </div>
        </div>

        <div className={styles.field}>
            <label className={styles.label}>Provincia</label>
            <select className={styles.input} name="provinceCode" value={form.provinceCode} onChange={handleChange}>
                <option value="">Seleccioná tu provincia</option>
                {PROVINCIAS_ARGENTINAS.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
        </div>

        {form.deliveryType === 'sucursal' ? (
            <div className={styles.field}>
                <label className={styles.label}>Sucursal</label>

                <label className={styles.label}>Localidad</label>
                <input
                    className={styles.input}
                    placeholder="Filtrá por ciudad (ej: Rosario)"
                    value={agencyFilter}
                    onChange={(e) => setAgencyFilter(e.target.value)}
                    disabled={!form.provinceCode || loadingAgencies}
                />
                <label className={`${styles.label} ${styles.fieldSpaced}`}>Sucursal</label>
                <select
                    className={`${styles.input} ${errors.agencyCode ? styles.inputError : ''}`}
                    value={form.agencyCode}
                    onChange={handleAgencySelect}
                    disabled={!form.provinceCode || loadingAgencies}
                >
                    <option value="">
                        {loadingAgencies
                            ? 'Cargando sucursales...'
                            : filteredAgencies.length === 0 && agencyFilter
                                ? 'Sin resultados para esa localidad'
                                : 'Seleccioná una sucursal'}
                    </option>
                    {filteredAgencies.map(a => (
                        <option key={a.code} value={a.code}>
                            {a.name} — {a.location.address.streetName} {a.location.address.streetNumber}
                        </option>
                    ))}
            </select>
            {errors.agencyCode && <span className={styles.error}>{errors.agencyCode}</span>}
            {shippingQuote && !quotingShipping && (
                <p className={styles.shippingDesc}>
                    Llega en {shippingQuote.deliveryTimeMin} a {shippingQuote.deliveryTimeMax} días hábiles
                </p>
            )}
        </div>
    ) : (
            <>
        <div className={styles.row}>
            <div className={styles.field} style={{ flex: 3 }}>
                <label className={styles.label}>Calle</label>
                <input
                    className={`${styles.input} ${errors.streetName ? styles.inputError : ''}`}
                    name="streetName"
                    value={form.streetName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: San Martín"
                />
                {errors.streetName && <span className={styles.error}>{errors.streetName}</span>}
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Número</label>
                <input
                    className={`${styles.input} ${errors.streetNumber ? styles.inputError : ''}`}
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="123"
                />
                {errors.streetNumber && <span className={styles.error}>{errors.streetNumber}</span>}
            </div>
        </div>
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Piso (opcional)</label>
                    <input className={styles.input} name="floor" placeholder="Ej: 2" value={form.floor} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Depto (opcional)</label>
                    <input className={styles.input} name="apartment" placeholder="Ej: B" value={form.apartment} onChange={handleChange} />
                </div>
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

                <div className={styles.row}>
                <div className={styles.field} style={{ flex: 3 }}>
                    <label className={styles.label}>Calle</label>
                    <input
                        className={`${styles.input} ${errors.streetName ? styles.inputError : ''}`}
                        name="streetName"
                        value={form.streetName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ej: San Martín"
                    />
                    {errors.streetName && <span className={styles.error}>{errors.streetName}</span>}
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Número</label>
                <input
                    className={`${styles.input} ${errors.streetNumber ? styles.inputError : ''}`}
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="123"
                />
                {errors.streetNumber && <span className={styles.error}>{errors.streetNumber}</span>}
            </div>
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
                <img
                    src={item.image}
                    alt={item.name}
                    className={styles.summaryItemImage}
                />
                <div className={styles.summaryItemInfo}>
                <span className={styles.summaryItemName}>{item.name}</span>
                <span className={styles.summaryItemDetails}>
                    {item.color.name} · Talle {item.size} · x{item.quantity}
                </span>
            </div>
            <span className={styles.summaryItemPrice}>
                ${(item.price * item.quantity).toLocaleString('es-AR')}
            </span>
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