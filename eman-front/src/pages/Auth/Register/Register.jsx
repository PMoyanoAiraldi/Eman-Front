import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { authService } from '../../../api/authService'
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

    const handleChange = (e) => {
        const { name, value } = e.target

        // Teléfono: solo permite números
        if (name === 'phone' && !/^\d*$/.test(value)) return

        setForm({ ...form, [name]: value })
        setError(null)
    }

    const passwordValid = passwordRules.every(r => r.test(form.password))

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!passwordValid) {
            setError('La contraseña no cumple los requisitos')
            return
        }

        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

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

                <form className={styles.form} onSubmit={handleSubmit}>

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
                            required
                        />
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
                            required
                        />
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
                            required
                        />
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
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>PROVINCIA</label>
                            <input
                                className={styles.input}
                                type="text"
                                name="province"
                                placeholder="Ej: Santa Fe"
                                value={form.province}
                                onChange={handleChange}
                                required
                            />
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
                                required
                                maxLength={20}
                            />
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