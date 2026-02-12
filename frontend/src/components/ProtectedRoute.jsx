import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (!token || !user) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />
    }

    return children
}
