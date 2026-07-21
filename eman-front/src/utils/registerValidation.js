const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü' -]*$/
const ADDRESS_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü0-9°.,#º -]*$/
const EMAIL_REGEX = /\S+@\S+\.\S+/
const PHONE_MAX_LENGTH = 10

// ── Sanitizadores: filtran lo que NO se puede ni escribir ──

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


export const PROVINCIAS_ARGENTINAS = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Ciudad Autónoma de Buenos Aires',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
]

export const validateProvince = (value) => {
    if (!value) return 'Seleccioná una provincia'
    return ''
}