import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

export default function Breadcrumb({ items }) {
    const visibles = items.filter(item => item.label)

    return (
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol className={styles.list}>
                {visibles.map((item, i) => (
                    <li key={i} className={styles.item}>
                        {item.path
                            ? <Link to={item.path} className={styles.link}>{item.label}</Link>
                            : <span className={styles.active} aria-current="page">{item.label}</span>
                        }
                    </li>
                ))}
            </ol>
        </nav>
    )
}