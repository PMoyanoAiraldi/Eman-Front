import { useState } from 'react'
import {
    sanitizeName, sanitizePhone, validateName, validatePhone, validateCity
} from '../utils/registerValidation'
import { sanitizeStreetName, sanitizeStreetNumber, validateStreetName, validateStreetNumber } from '../utils/addressValidation'
import { validateProvince } from '../utils/provinces'
import { passwordRules } from '../components/PasswordChecklist/passwordRules'

const validators = {
    name: validateName,
    streetName: validateStreetName,
    streetNumber: validateStreetNumber,
    city: validateCity,
    provinceCode: validateProvince,
    phone: validatePhone,
}

export const usePersonalDataForm = (initialValues) => {
    const [form, setForm] = useState(initialValues)
    const [errors, setErrors] = useState({})

    const handleBlur = (e) => {
        const { name, value } = e.target
        if (validators[name]) {
            setErrors((prev) => ({ ...prev, [name]: validators[name](value) }))
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        let cleanValue = value

        if (name === 'name') cleanValue = sanitizeName(value)
        if (name === 'streetName') cleanValue = sanitizeStreetName(value)
        if (name === 'streetNumber') cleanValue = sanitizeStreetNumber(value)
        if (name === 'phone') cleanValue = sanitizePhone(value)

        setForm((prev) => ({ ...prev, [name]: cleanValue }))

        if (errors[name] && validators[name]) {
            setErrors((prev) => ({ ...prev, [name]: validators[name](cleanValue) }))
        }
    }

    const passwordValid = passwordRules.every((r) => r.test(form.password))

    const validateForm = () => {
        const newErrors = {
            name: validateName(form.name),
            streetName: validateStreetName(form.streetName),
            streetNumber: validateStreetNumber(form.streetNumber),
            city: validateCity(form.city),
            provinceCode: validateProvince(form.provinceCode),
            phone: validatePhone(form.phone),
        }

        if (!passwordValid) newErrors.password = 'La contraseña no cumple los requisitos'
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'

        setErrors(newErrors)
        return Object.values(newErrors).every((e) => !e)
    }

    return { form, setForm, errors, setErrors, handleChange, handleBlur, passwordValid, validateForm }
}