import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../../api/authService'
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb'
import styles from './Register.module.css'

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

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

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
                            <input
                                className={styles.input}
                                type="password"
                                name="password"
                                placeholder="Mínimo 8 caracteres, mayús, núm y símbolo"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>REPETIR CONTRASEÑA</label>
                            <input
                                className={styles.input}
                                type="password"
                                name="confirmPassword"
                                placeholder="Repetí tu contraseña"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
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
                            />
                        </div>
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