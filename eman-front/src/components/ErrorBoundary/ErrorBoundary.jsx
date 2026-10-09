import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

class ErrorBoundary extends Component {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.error('Error capturado:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.page} role="alert">
                    <div className={styles.card}>
                        <h1 className={styles.title}>Algo salió mal</h1>
                        <p className={styles.message}>
                            Ocurrió un error inesperado. Intentá recargar la página, sino volvé al inicio.
                        </p>
                        <div className={styles.actions}>
                            <button type="button" className={styles.primaryBtn} onClick={() => window.location.reload()}>
                                Recargar página
                            </button>
                            <button type="button" className={styles.secondaryBtn} onClick={() => { window.location.href = '/' }}>
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary