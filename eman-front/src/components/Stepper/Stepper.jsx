import styles from './Stepper.module.css'

const STEPS = ['Datos personales', 'Envío', 'Pago', 'Confirmación']

const Stepper = ({ currentStep }) => {
    return (
        <div className={styles.stepper}>
            {STEPS.map((label, i) => (
                <div key={i} className={styles.stepItem}>
                    <div className={`${styles.stepCircle} ${currentStep > i + 1 ? styles.stepDone : ''} ${currentStep === i + 1 ? styles.stepActive : ''}`}>
                        {currentStep > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`${styles.stepLabel} ${currentStep === i + 1 ? styles.stepLabelActive : ''}`}>
                        {label}
                    </span>
                    {i < STEPS.length - 1 && (
                        <div className={`${styles.stepLine} ${currentStep > i + 1 ? styles.stepLineDone : ''}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default Stepper