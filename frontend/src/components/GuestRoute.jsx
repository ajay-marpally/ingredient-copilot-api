import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * GuestRoute - Only allows unauthenticated users
 * Redirects logged-in users to home page
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-paper-texture">
        <LoadingSpinner message="Loading..." />
      </div>
    )
  }

  if (isAuthenticated) {
    // Redirect to the page they came from, or home
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  return children
}
