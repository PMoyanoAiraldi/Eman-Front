import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cloudinaryService } from '../../api/cloudinaryService'
import styles from './UsageBanner.module.css'

const UsageBanner = () => {
    const [percent, setPercent] = useState(null)

    useEffect(() => {
        cloudinaryService.getUsage()
            .then(setPercent)
            .catch(() => setPercent(null))
    }, [])

    if (percent === null || percent < 80) return null

    const critical = percent >= 95

    return (
        <div className={`${styles.banner} ${critical ? styles.danger : styles.warning}`}>
            <AlertTriangle size={18} strokeWidth={1.5} />
            <span>
                El espacio de imágenes de la tienda está al {Math.round(percent)}% de su capacidad.
                Avisanos para ampliar el plan antes de que se llene.
            </span>
        </div>
    )
}

export default UsageBanner