import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../api/authService'
import { CheckCircle } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import styles from './ForgotPasswordPage.module.css'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await authService.forgotPassword(email)
            setSent(true) // siempre mostramos éxito, exista o no el email
        } catch (err) {
            setError('Ocurrió un error, intentá de nuevo más tarde', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Iniciar sesión', path: '/login' },
                { label: 'Recuperar contraseña' },
            ]} />

            <div className={styles.container}>
                <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>

                {sent ? (
                    <div className={styles.successBox}>
                    <CheckCircle size={32} className={styles.successIcon} />
                    <p className={styles.success}>
                        Si el email está registrado, te enviamos un correo con instrucciones para restablecer tu contraseña.
                    </p>
                    </div>
                ) : (
                    <>
                        <p className={styles.subtitle}>
                            Ingresá tu email y te mandamos un link para crear una nueva contraseña.
                        </p>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.field}>
                                <label className={styles.label}>EMAIL</label>
                                <input
                                    className={styles.input}
                                    type="email"
                                    placeholder="Ej: juan@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <p className={styles.error}>{error}</p>}

                            <button className={styles.button} type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar link'}
                            </button>
                        </form>
                    </>
                )}

                <p className={styles.footer}>
                    <Link to="/login" className={styles.footerLink}>Volver a iniciar sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default ForgotPasswordPage