import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { authService } from '../../api/authService'
import { setCredentials } from '../../redux/slices/authReducer'
import { usePersonalDataForm } from '../../hooks/usePersonalDataForm'
import { PROVINCIAS_ARGENTINAS } from '../../utils/provinces'
import PasswordChecklist from '../PasswordChecklist/PasswordChecklist'
import styles from './RegisterFromOrderCard.module.css'
import { Eye, EyeOff } from 'lucide-react'

const RegisterFromOrderCard = ({ orderId, order, onRegistered }) => {
    const dispatch = useDispatch()
    const { form, errors, handleChange, handleBlur, validateForm } = usePersonalDataForm({
        name: order.guestName ?? '',
        phone: order.guestPhone ?? '',
        streetName: order.streetName ?? '',
        streetNumber: order.streetNumber ?? '',
        floor: order.floor ?? '',
        apartment: order.apartment ?? '',
        city: order.city ?? '',
        provinceCode: order.provinceCode ?? '',
        password: '',
        confirmPassword: '',
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [emailTaken, setEmailTaken] = useState(false)

    const [expanded, setExpanded] = useState(false)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const passwordsMatch = form.password === form.confirmPassword

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!validateForm()) return

        setLoading(true)
        try {
            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...dataToSend } = form
            const { user, accessToken } = await authService.registerFromOrder({
                orderId,
                email: order.guestEmail,
                ...dataToSend,
            })
            dispatch(setCredentials({ user, accessToken }))
            onRegistered?.()
        } catch (err) {
            if (err.response?.data?.message === 'El email ya está registrado') {
                setEmailTaken(true)
            } else {
                setError(err.response?.data?.message ?? 'No pudimos crear tu cuenta, probá de nuevo')
            }
        } finally {
            setLoading(false)
        }
    }

    if (emailTaken) {
        return (
            <div className={styles.card}>
                <p className={styles.text}>
                    Ya tenés una cuenta con {order.guestEmail}. Iniciá sesión para ver esta compra en tu panel.
                </p>
                <a href={`/login?email=${encodeURIComponent(order.guestEmail)}`} className={styles.link}>
                    Iniciar sesión
                </a>
            </div>
        )
    }

    if (!expanded) {
        return (
            <div className={styles.card}>
                <h3 className={styles.title}>¿Querés ver esta compra en tu panel?</h3>
                <p className={styles.text}>
                    Creá tu cuenta con los datos que ya nos diste — te lleva menos de un minuto.
                </p>
                <button className={styles.expandBtn} onClick={() => setExpanded(true)}>
                    Crear mi cuenta
                </button>
            </div>
        )
    }

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>¿Querés ver esta compra en tu panel?</h3>
            <p className={styles.text}>
                Creá tu cuenta con los datos que ya nos diste — revisalos, corregilos si hace falta, y elegí una contraseña.
            </p>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.readonlyField}>
                    {order.guestEmail}
                </div>

                <div className={styles.field}>
                    <input className={styles.input} name="name" placeholder="Nombre y apellido"
                        value={form.name} onChange={handleChange} onBlur={handleBlur} />
                    {errors.name && <p className={styles.error}>{errors.name}</p>}
                </div>

                <div className={styles.field}>
                    <input className={styles.input} name="phone" placeholder="Teléfono"
                        value={form.phone} onChange={handleChange} onBlur={handleBlur} />
                    {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                </div>

            <div className={styles.row}>
                    <div className={styles.field}>
                        <input className={styles.input} name="streetName" placeholder="Calle"
                            value={form.streetName} onChange={handleChange} onBlur={handleBlur} />
                        {errors.streetName && <p className={styles.error}>{errors.streetName}</p>}
                    </div>
                    <div className={styles.field}>
                        <input className={styles.input} name="streetNumber" placeholder="Número"
                            value={form.streetNumber} onChange={handleChange} onBlur={handleBlur} />
                        {errors.streetNumber && <p className={styles.error}>{errors.streetNumber}</p>}
                    </div>
                </div>

                <div className={styles.row}>
                    <input className={styles.input} name="floor" placeholder="Piso (opcional)"
                        value={form.floor} onChange={handleChange} />
                    <input className={styles.input} name="apartment" placeholder="Depto (opcional)"
                        value={form.apartment} onChange={handleChange} />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <input className={styles.input} name="city" placeholder="Ciudad"
                            value={form.city} onChange={handleChange} onBlur={handleBlur} />
                        {errors.city && <p className={styles.error}>{errors.city}</p>}
                    </div>
                    <div className={styles.field}>
                        <select className={styles.input} name="provinceCode"
                            value={form.provinceCode} onChange={handleChange} onBlur={handleBlur}>
                            <option value="">Provincia...</option>
                            {PROVINCIAS_ARGENTINAS.map((p) => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                        </select>
                        {errors.provinceCode && <p className={styles.error}>{errors.provinceCode}</p>}
                    </div>
                </div>

                <div className={styles.field}>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.input}
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword((p) => !p)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                        </button>
                    </div>
                    <PasswordChecklist password={form.password} />
                </div>

                <div className={styles.field}>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.input}
                            type={showConfirm ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Repetir contraseña"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowConfirm((p) => !p)}
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                        </button>
                    </div>
                        {form.confirmPassword.length > 0 && (
                    <p className={passwordsMatch ? styles.matchOk : styles.matchError}>
                        {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                    </p>
                )}
            </div>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" disabled={loading} className={styles.btn}>
                    {loading ? 'Creando cuenta...' : 'Crear cuenta y ver mi compra'}
                </button>
            </form>
        </div>
    )
}

export default RegisterFromOrderCard