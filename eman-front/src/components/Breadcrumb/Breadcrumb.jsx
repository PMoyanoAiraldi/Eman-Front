import { useNavigate } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

export default function Breadcrumb({ items }) {
    const navigate = useNavigate()

    return (
        <nav className={styles.breadcrumb}>
            {items.map((item, i) => (
                <span key={i}>
                    {i > 0 && <span className={styles.separator}> / </span>}
                    {item.path
                        ? <span className={styles.link} onClick={() => navigate(item.path)}>{item.label}</span>
                        : <span className={styles.active}>{item.label}</span>
                    }
                </span>
            ))}
        </nav>
    )
}