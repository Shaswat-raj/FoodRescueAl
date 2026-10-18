import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingPage from './LoadingPage.jsx'

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingPage />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'DONOR' ? '/donor' : '/ngo'} replace />
  return <Outlet />
}
