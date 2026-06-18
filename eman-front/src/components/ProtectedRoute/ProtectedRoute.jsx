import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && user?.rol !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute