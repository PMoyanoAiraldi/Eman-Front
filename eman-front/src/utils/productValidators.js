// src/utils/validators/productValidators.js

export const validateProductField = (name, value) => {
    switch (name) {
        case 'name':
            if (!value.trim()) return 'El nombre es obligatorio'
            if (value.trim().length < 3) return 'Mínimo 3 caracteres'
            return ''

        case 'description':
            if (!value.trim()) return 'La descripción es obligatoria'
            if (value.trim().length < 10) return 'Mínimo 10 caracteres'
            return ''

        case 'price': {
            if (value === '' || value === null) return 'El precio es obligatorio'
            const num = Number(value)
            if (isNaN(num) || num <= 0) return 'Ingresá un precio válido mayor a 0'
            return ''
        }

        case 'weightGrams': {
            if (value === '' || value === null || value === undefined) return '' // opcional, cae al default 200
            const num = Number(value)
            if (isNaN(num) || num < 1 || num > 25000) return 'El peso debe estar entre 1 y 25000 gramos'
            return ''
        }

        case 'gender':
            if (!value) return 'Seleccioná un género'
            return ''

        case 'categoryId':
            if (!value) return 'Seleccioná una categoría'
            return ''

        case 'subcategoryId':
            if (!value) return 'Seleccioná una subcategoría'
            return ''

        default:
            return ''
    }
}

// Campos obligatorios del paso 1 (marca y tipo de producto quedan opcionales)
export const REQUIRED_PRODUCT_FIELDS = ['name', 'description', 'price', 'gender', 'categoryId', 'subcategoryId']

export const validateProductForm = (form) => {
    const errors = {}
    REQUIRED_PRODUCT_FIELDS.forEach(field => {
        const error = validateProductField(field, form[field])
        if (error) errors[field] = error
    })
    return errors
}

export const isFormValid = (errors) => Object.keys(errors).length === 0