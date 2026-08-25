export const sanitizeStreetName = (value) => {
    return value
        .split('')
        .filter((char) => /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü' -]*$/.test(char))
        .join('')
}

export const sanitizeStreetNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 6)
}

export const validateStreetName = (value) => {
    const v = value.trim()
    if (!v) return 'La calle es requerida'
    if (v.length < 3) return 'Ingresá una calle válida'
    return ''
}

export const validateStreetNumber = (value) => {
    const v = value.trim()
    if (!v) return 'El número es requerido'
    if (!/^\d+$/.test(v)) return 'Solo números'
    return ''
}