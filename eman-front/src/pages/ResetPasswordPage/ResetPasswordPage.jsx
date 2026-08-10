import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../../api/authService'
import { Eye, EyeOff } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import styles from './ResetPasswordPage.module.css'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (form.newPassword !== form.confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (!token) {
            setError('Link inválido, pedí uno nuevo')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await authService.resetPassword(token, form.newPassword)
            setSuccess(true)
            setTimeout(() => navigate('/login'), 2500)
        } catch (err) {
            setError(err.response?.data?.message || 'El link expiró o no es válido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Restablecer contraseña' },
            ]} />

            <div className={styles.container}>
                <h1 className={styles.title}>Crear nueva contraseña</h1>

                {success ? (
                    <p className={styles.success}>
                        ¡Contraseña actualizada! Te estamos redirigiendo al login...
                    </p>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label className={styles.label}>NUEVA CONTRASEÑA</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={styles.input}
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={form.newPassword}
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

                        <div className={styles.field}>
                            <label className={styles.label}>CONFIRMAR CONTRASEÑA</label>
                            <input
                                className={styles.input}
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button className={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Restablecer contraseña'}
                        </button>
                    </form>
                )}

                <p className={styles.footer}>
                    <Link to="/login" className={styles.footerLink}>Volver a iniciar sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default ResetPasswordPage