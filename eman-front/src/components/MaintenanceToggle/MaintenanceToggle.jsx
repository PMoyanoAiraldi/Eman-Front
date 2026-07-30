import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Power } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal' 
import { toggleMaintenanceMode } from '../../redux/slices/siteSettingsReducer'
import styles from './MaintenanceToggle.module.css'

const MaintenanceToggle = () => {
    const dispatch = useDispatch()
    const { maintenanceMode } = useSelector(state => state.siteSettings)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleConfirm = () => {
        dispatch(toggleMaintenanceMode())
        setShowConfirm(false)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.statusRow}>
                <span className={`${styles.dot} ${maintenanceMode ? styles.dotOff : styles.dotOn}`} />
                <span className={styles.statusText}>
                    Tienda {maintenanceMode ? 'inhabilitada' : 'activa'}
                </span>
            </div>

            <button
                className={`${styles.toggleBtn} ${maintenanceMode ? styles.btnHabilitar : styles.btnInhabilitar}`}
                onClick={() => setShowConfirm(true)}
            >
                <Power size={16} strokeWidth={1.5} />
                {maintenanceMode ? 'Habilitar página' : 'Inhabilitar página'}
            </button>

            
                <ConfirmModal
                    isOpen={showConfirm}
                    title={maintenanceMode ? 'Habilitar página' : 'Inhabilitar página'}
                    message={
                        maintenanceMode
                            ? '¿Confirmás que querés volver a habilitar la tienda? Los visitantes van a poder navegar y comprar de nuevo.'
                            : '¿Confirmás que querés inhabilitar toda la tienda? Nadie va a poder navegar ni comprar hasta que la vuelvas a habilitar desde acá.'
                    }
                    onConfirm={handleConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            
        </div>
    )
}

export default MaintenanceToggle