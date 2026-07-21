import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { authService } from '../../../api/authService'
import {
    sanitizeName, sanitizePhone, sanitizeAddress,
    validateName, validateEmail, validatePhone,
    validateAddress, validateCity, validateProvince,
    PROVINCIAS_ARGENTINAS,
} from '../../../utils/registerValidation'
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb'
import styles from './Register.module.css'

const passwordRules = [
    { label: '8 caracteres', test: (p) => p.length >= 8 },
    { label: '1 mayúscula', test: (p) => /[A-Z]/.test(p) },
    { label: '1 minúscula', test: (p) => /[a-z]/.test(p) },
    { label: '1 número', test: (p) => /\d/.test(p) },
    { label: '1 carácter especial', test: (p) => /[=!@#$%^&*]/.test(p) },
]


const RegisterPage = () => {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        province: '',
        phone: '',
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    

    const validators = {
        name: validateName,
        email: validateEmail,
        address: validateAddress,
        city: validateCity,
        province: validateProvince,
        phone: validatePhone,
    }

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
        if (name === 'address') cleanValue = sanitizeAddress(value)
        if (name === 'phone') cleanValue = sanitizePhone(value)

        setForm({ ...form, [name]: cleanValue })
        setError(null)

        // si el campo ya tiene error visible, re-validar en cada cambio
        if (errors[name] && validators[name]) {
            setErrors((prev) => ({ ...prev, [name]: validators[name](cleanValue) }))
        }
    }

    const passwordValid = passwordRules.every(r => r.test(form.password))

    
    const validateForm = () => {
        const newErrors = {
            name: validateName(form.name),
            email: validateEmail(form.email),
            address: validateAddress(form.address),
            city: validateCity(form.city),
            province: validateProvince(form.province),
            phone: validatePhone(form.phone),
        }

        if (!passwordValid) newErrors.password = 'La contraseña no cumple los requisitos'
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'

        setErrors(newErrors)
        return Object.values(newErrors).every((e) => !e)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        setError(null)

        try {
            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...dataToSend } = form
            await authService.register(dataToSend)
            // Registro exitoso → redirige al login con mensaje
            navigate('/login', { state: { registered: true } })
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse. Intentá de nuevo.')
        } finally {
            setLoading(false)
        }
    }
    

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Crear cuenta' },
            ]} />

            <div className={styles.container}>
                <h1 className={styles.title}>Crear cuenta</h1>
                <p className={styles.subtitle}>Completá tus datos para registrarte y hacer seguimiento de tus pedidos.</p>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>

                    <p className={styles.sectionLabel}>Datos personales</p>

                    <div className={styles.field}>
                        <label className={styles.label}>NOMBRE Y APELLIDO</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="name"
                            placeholder="Ej: Juan Pérez"
                            value={form.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.name && <p className={styles.error}>{errors.name}</p>}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>EMAIL</label>
                        <input
                            className={styles.input}
                            type="email"
                            name="email"
                            placeholder="Ej: juan@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.email && <p className={styles.error}>{errors.email}</p>}
                    </div>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>CONTRASEÑA</label>
                            <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Tu contraseña"
                                value={form.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                required
                            />
                            <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(p => !p)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                            </button>
                        </div>

                        {(passwordFocused || form.password.length > 0) && (
                                <ul className={styles.checklist}>
                                    {passwordRules.map((rule) => {
                                        const ok = rule.test(form.password)
                                        return (
                                            <li key={rule.label} className={`${styles.checkItem} ${ok ? styles.checkOk : ''}`}>
                                                <span className={styles.checkIcon}>
                                                    {ok ? <Check size={11} strokeWidth={2.5} /> : <span className={styles.checkDot} />}
                                                </span>
                                                {rule.label}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>REPETIR CONTRASEÑA</label>
                            <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Repetí tu contraseña"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowConfirm(p => !p)}
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                                </button>
                            </div>
                            {form.confirmPassword.length > 0 && (
                                <p className={form.password === form.confirmPassword ? styles.matchOk : styles.matchError}>
                                    {form.password === form.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                                </p>
                            )}

                        </div>
                    </div>

                    <p className={styles.sectionLabel}>Datos de envío</p>

                    <div className={styles.field}>
                        <label className={styles.label}>DIRECCIÓN</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="address"
                            placeholder="Ej: Av. Corrientes 1234"
                            value={form.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.address && <p className={styles.error}>{errors.address}</p>}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>CIUDAD</label>
                            <input
                                className={styles.input}
                                type="text"
                                name="city"
                                placeholder="Ej: Buenos Aires"
                                value={form.city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            {errors.city && <p className={styles.error}>{errors.city}</p>}
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>PROVINCIA</label>
                            <select
                                className={styles.input}
                                name="province"
                                value={form.province}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            >
                            <option value="">Seleccioná...</option>
                                {PROVINCIAS_ARGENTINAS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            {errors.province && <p className={styles.error}>{errors.province}</p>}
                        </div>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>TELÉFONO</label>
                            <input
                                className={styles.input}
                                type="tel"
                                name="phone"
                                placeholder="Ej: 3404123456"
                                value={form.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                maxLength={20}
                            />
                            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                        </div>
                    

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        className={styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" className={styles.footerLink}>Iniciá sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage;