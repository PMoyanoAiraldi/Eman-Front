import { Component } from 'react'

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
            <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Ocurrió un error inesperado.</p>
            <button onClick={() => window.location.href = '/'}>Volver al inicio</button>
            </div>
        )
        }
        return this.props.children
    }
}

export default ErrorBoundary