import styles from './Stepper.module.css'

const DEFAULT_STEPS = ['Datos personales', 'Envío', 'Pago', 'Confirmación']

const Stepper = ({ currentStep, steps = DEFAULT_STEPS }) => {
    return (
        <div className={styles.stepper}>
            {steps.map((label, i) => (
                <div key={i} className={styles.stepItem}>
                    <div className={`${styles.stepCircle} ${currentStep > i + 1 ? styles.stepDone : ''} ${currentStep === i + 1 ? styles.stepActive : ''}`}>
                        {currentStep > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`${styles.stepLabel} ${currentStep === i + 1 ? styles.stepLabelActive : ''}`}>
                        {label}
                    </span>
                    {i < steps.length - 1 && (
                        <div className={`${styles.stepLine} ${currentStep > i + 1 ? styles.stepLineDone : ''}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default Stepper