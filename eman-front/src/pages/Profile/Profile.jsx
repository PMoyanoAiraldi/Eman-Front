import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Eye, EyeOff, Check } from 'lucide-react'
import { setCredentials } from '../../redux/slices/authReducer'
import { userService } from '../../api/userService'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import styles from './Profile.module.css'

const passwordRules = [
    { label: '8 caracteres', test: (p) => p.length >= 8 },
    { label: '1 mayúscula', test: (p) => /[A-Z]/.test(p) },
    { label: '1 minúscula', test: (p) => /[a-z]/.test(p) },
    { label: '1 número', test: (p) => /\d/.test(p) },
    { label: '1 carácter especial', test: (p) => /[=!@#$%^&*]/.test(p) },
]

const ProfilePage = () => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.auth.user)
    const accessToken = useSelector(state => state.auth.accessToken) 

    // --- Datos personales ---
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        address: user?.address || '',
        city: user?.city || '',
        province: user?.province || '',
        phone: user?.phone || '',
    })
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState(false)
    const [profileError, setProfileError] = useState(null)

    // --- Contraseña ---
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState(null)

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        if (name === 'phone' && !/^\d*$/.test(value)) return
        setProfileForm({ ...profileForm, [name]: value })
        setProfileSuccess(false)
        setProfileError(null)
    }

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
        setPasswordSuccess(false)
        setPasswordError(null)
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setProfileLoading(true)
        setProfileError(null)
        setProfileSuccess(false)

        try {
            await userService.updateProfile(profileForm)
            // Actualizamos Redux con los nuevos datos
            dispatch(setCredentials({
                user: { ...user, ...profileForm },
                accessToken, // el token actual
            }))
            setProfileSuccess(true)
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Error al actualizar los datos')
        } finally {
            setProfileLoading(false)
        }
    }

    const passwordValid = passwordRules.every(r => r.test(passwordForm.newPassword))

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()

        if (!passwordValid) {
            setPasswordError('La nueva contraseña no cumple los requisitos')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Las contraseñas no coinciden')
            return
        }

        setPasswordLoading(true)
        setPasswordError(null)
        setPasswordSuccess(false)

        try {
            await userService.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
            setPasswordSuccess(true)
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Error al cambiar la contraseña')
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Mi perfil' },
            ]} />

            <div className={styles.container}>
                <h1 className={styles.title}>Mi perfil</h1>
                <p className={styles.subtitle}>Gestioná tus datos personales y tu contraseña.</p>

                {/* SECCIÓN: Mis datos */}
                <form className={styles.form} onSubmit={handleProfileSubmit}>
                    <p className={styles.sectionLabel}>Mis datos</p>

                    {/* Email solo lectura */}
                    <div className={styles.field}>
                        <label className={styles.label}>EMAIL</label>
                        <input
                            className={`${styles.input} ${styles.inputReadonly}`}
                            type="email"
                            value={user?.email || ''}
                            readOnly
                        />
                        <span className={styles.readonlyHint}>El email no puede modificarse</span>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>NOMBRE Y APELLIDO</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>DIRECCIÓN</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="address"
                            value={profileForm.address}
                            onChange={handleProfileChange}
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
                                value={profileForm.city}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>PROVINCIA</label>
                            <input
                                className={styles.input}
                                type="text"
                                name="province"
                                value={profileForm.province}
                                onChange={handleProfileChange}
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
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            required
                            maxLength={20}
                        />
                    </div>

                    {profileError && <p className={styles.error}>{profileError}</p>}
                    {profileSuccess && <p className={styles.success}>Datos actualizados correctamente</p>}

                    <button className={styles.button} type="submit" disabled={profileLoading}>
                        {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>

                {/* SECCIÓN: Seguridad */}
                <form className={styles.form} onSubmit={handlePasswordSubmit}>
                    <p className={styles.sectionLabel}>Seguridad</p>

                    <div className={styles.field}>
                        <label className={styles.label}>CONTRASEÑA ACTUAL</label>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                type={showOld ? 'text' : 'password'}
                                name="oldPassword"
                                placeholder="Tu contraseña actual"
                                value={passwordForm.oldPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowOld(p => !p)} tabIndex={-1}>
                                {showOld ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>NUEVA CONTRASEÑA</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={styles.input}
                                    type={showNew ? 'text' : 'password'}
                                    name="newPassword"
                                    placeholder="Tu nueva contraseña"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    required
                                />
                                <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                                    {showNew ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                                </button>
                            </div>
                            {(passwordFocused || passwordForm.newPassword.length > 0) && (
                                <ul className={styles.checklist}>
                                    {passwordRules.map((rule) => {
                                        const ok = rule.test(passwordForm.newPassword)
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
                            <label className={styles.label}>CONFIRMAR CONTRASEÑA</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={styles.input}
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Repetí tu nueva contraseña"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                                    {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                                </button>
                            </div>
                            {passwordForm.confirmPassword.length > 0 && (
                                <p className={passwordForm.newPassword === passwordForm.confirmPassword ? styles.matchOk : styles.matchError}>
                                    {passwordForm.newPassword === passwordForm.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                                </p>
                            )}
                        </div>
                    </div>

                    {passwordError && <p className={styles.error}>{passwordError}</p>}
                    {passwordSuccess && <p className={styles.success}>Contraseña actualizada correctamente</p>}

                    <button className={styles.button} type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage