import styles from './Stepper.module.css'

const DEFAULT_STEPS = ['Datos personales', 'Envío', 'Resumen', 'Pago', 'Confirmación']

const Stepper = ({ currentStep, steps = DEFAULT_STEPS }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.stepper}>
                {steps.map((label, i) => {
                    const isDone = currentStep > i + 1
                    const isActive = currentStep === i + 1
                    return (
                        <div key={i} className={styles.stepItem}>
                            <div
                                className={`${styles.stepCircle} ${isDone ? styles.stepDone : ''} ${isActive ? styles.stepActive : ''}`}
                                aria-label={`${label}${isDone ? ' (completado)' : ''}`}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                {isDone ? '✓' : i + 1}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                            )}
                        </div>
                    )
                })}
            </div>

            <p className={styles.currentLabel}>
                Paso {currentStep} de {steps.length} · {steps[currentStep - 1] ?? ''}
            </p>
        </div>
    )
}

export default Stepper