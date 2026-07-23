const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü' -]*$/
const ADDRESS_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü0-9°.,#º -]*$/
const ZIPCODE_REGEX = /^[A-Za-z0-9]*$/
const EMAIL_REGEX = /\S+@\S+\.\S+/
const PHONE_MAX_LENGTH = 10

// ── Sanitizadores: se usan en el onChange, filtran lo que NO se puede ni escribir ──

export const sanitizeName = (value) => {
  // deja pasar solo letras (con acentos/ñ), espacios, guiones y apóstrofes
    return value
        .split('')
        .filter((char) => NAME_REGEX.test(char))
        .join('')
}

export const sanitizeAddress = (value) => {
  // letras, números, espacios y algunos signos típicos de direcciones (Av. Corrientes 1234, 2° B)
    return value
        .split('')
        .filter((char) => ADDRESS_REGEX.test(char))
        .join('')
}


export const sanitizePhone = (value) => {
  // solo dígitos, tope de 10
    return value.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH)
}

export const sanitizeZipCode = (value) => {
    return value
        .split('')
        .filter((char) => ZIPCODE_REGEX.test(char))
        .slice(0, 8)
        .join('')
}

// ── Validadores de un solo campo: devuelven un string de error o '' si está OK ──

export const validateName = (value) => {
    const v = value.trim()
    if (!v) return 'El nombre es requerido'
    if (v.length < 3 || !v.includes(' ')) return 'Ingresá nombre y apellido completos'
    return ''
}

export const validateEmail = (value) => {
    const v = value.trim()
    if (!v) return 'El email es requerido'
    if (!EMAIL_REGEX.test(v)) return 'Email inválido'
    return ''
}

export const validatePhone = (value) => {
    const v = value.trim()
    if (!v) return 'El teléfono es requerido'
    if (v.startsWith('0')) return 'No incluyas el 0 de área'
    if (v.startsWith('15')) return 'No incluyas el 15'
    if (v.length < PHONE_MAX_LENGTH) return `Faltan ${PHONE_MAX_LENGTH - v.length} dígitos`
    return ''
}

export const validateAddress = (value) => {
    const v = value.trim()
    if (!v) return 'La dirección es requerida'
    if (v.length < 5) return 'Ingresá una dirección completa'
    if (!/\d/.test(v)) return 'Incluí el número de la dirección'
    return ''
}

export const validateCity = (value) => {
    const v = value.trim()
    if (!v) return 'La ciudad es requerida'
    if (v.length < 3) return 'Ingresá una ciudad válida'
    return ''
}

export const validateZipCode = (value) => {
    const v = value.trim()
    if (!v) return 'El código postal es requerido'
    if (v.length < 4) return 'Código postal inválido'
    return ''
}

export const validateLocality = (value) => {
    if (!value) return 'Seleccioná una localidad'
    return ''
}

// ── Validador de paso completo ──

export const validateStep1 = (form) => {
    const errors = {}

    const nameError = validateName(form.guestName)
        if (nameError) errors.guestName = nameError

    const emailError = validateEmail(form.guestEmail)
        if (emailError) errors.guestEmail = emailError

    const phoneError = validatePhone(form.guestPhone)
        if (phoneError) errors.guestPhone = phoneError

    return errors
}

export const validateStep2 = (form) => {
    const errors = {}

    if (form.shippingType === 'correo_argentino') {
        const addressError = validateAddress(form.address)
        if (addressError) errors.address = addressError

        const cityError = validateCity(form.city)
        if (cityError) errors.city = cityError

        const zipError = validateZipCode(form.zipCode)
        if (zipError) errors.zipCode = zipError
    }
    if (form.shippingType === 'coordinado') {
        const localityError = validateLocality(form.locality)
        if (localityError) errors.locality = localityError

        const addressError = validateAddress(form.address)
        if (addressError) errors.address = addressError
    }

    return errors
}


export const PHONE_LENGTH = PHONE_MAX_LENGTH