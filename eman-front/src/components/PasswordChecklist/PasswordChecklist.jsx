import { Check } from 'lucide-react'
import { passwordRules } from './passwordRules'
import styles from './PasswordChecklist.module.css'

const PasswordChecklist = ({ password }) => (
    <ul className={styles.checklist}>
        {passwordRules.map((rule) => {
            const ok = rule.test(password)
            return (
                <li key={rule.label} className={`${styles.checkItem} ${ok ? styles.checkOk : ''}`}>
                    <span className={styles.checkIcon} aria-hidden="true">
                        {ok ? <Check size={11} strokeWidth={2.5} /> : <span className={styles.checkDot} />}
                    </span>
                    {rule.label}
                    <span className={styles.srOnly}>{ok ? ' (cumplido)' : ' (pendiente)'}</span>
                </li>
            )
        })}
    </ul>
)

export default PasswordChecklist