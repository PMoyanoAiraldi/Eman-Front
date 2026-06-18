import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setCredentials } from '../../../redux/slices/authReducer'
import { authService } from '../../../api/authService'
import { Eye, EyeOff } from 'lucide-react'
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb'
import styles from './Login.module.css'

const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const data = await authService.login(form.email, form.password)
            dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }))

            // Redirige según rol
            if (data.user.rol === 'admin') {
                navigate('/admin')
            } else {
                navigate('/')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Email o contraseña incorrectos')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Iniciar sesión' },
            ]} />

            <div className={styles.container}>
                <h1 className={styles.title}>Iniciar sesión</h1>
                <p className={styles.subtitle}>Accedé a tu cuenta para ver tus pedidos y gestionar tus datos.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
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
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        className={styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿No tenés cuenta?{' '}
                    <Link to="/register" className={styles.footerLink}>Registrate</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;