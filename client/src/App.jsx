import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { useToast }               from './hooks/useToast.js'
import { ToastContainer }         from './components/Toast.jsx'
import ProtectedRoute             from './components/ProtectedRoute.jsx'
import AppLayout                  from './components/AppLayout.jsx'
import LoadingPage                from './components/LoadingPage.jsx'

import Landing          from './pages/Landing.jsx'
import Login            from './pages/Login.jsx'
import Register         from './pages/Register.jsx'
import Notifications    from './pages/Notifications.jsx'

import DonorDashboard   from './pages/donor/DonorDashboard.jsx'
import CreateDonation   from './pages/donor/CreateDonation.jsx'
import DonationHistory  from './pages/donor/DonationHistory.jsx'
import DonationDetail   from './pages/donor/DonationDetail.jsx'

import NgoDashboard     from './pages/ngo/NgoDashboard.jsx'
import NgoRequests      from './pages/ngo/NgoRequests.jsx'
import NgoHistory       from './pages/ngo/NgoHistory.jsx'
import RequestDetail    from './pages/ngo/RequestDetail.jsx'
import AssignVolunteer  from './pages/ngo/AssignVolunteer.jsx'
import PickupVerify     from './pages/ngo/PickupVerify.jsx'

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingPage />
  if (!user)   return <Navigate to="/" replace />
  return <Navigate to={user.role === 'DONOR' ? '/donor' : '/ngo'} replace />
}

function AppRoutes() {
  const { toasts, toast } = useToast()
  return (
    <>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/me"       element={<RoleRedirect />} />

        {/* Donor routes */}
        <Route element={<ProtectedRoute role="DONOR" />}>
          <Route element={<AppLayout />}>
            <Route path="/donor"              element={<DonorDashboard />} />
            <Route path="/donor/donate"       element={<CreateDonation />} />
            <Route path="/donor/history"      element={<DonationHistory />} />
            <Route path="/donor/donation/:id" element={<DonationDetail />} />
            <Route path="/donor/notifications"element={<Notifications />} />
          </Route>
        </Route>

        {/* NGO routes */}
        <Route element={<ProtectedRoute role="NGO" />}>
          <Route element={<AppLayout />}>
            <Route path="/ngo"                       element={<NgoDashboard />} />
            <Route path="/ngo/requests"              element={<NgoRequests />} />
            <Route path="/ngo/history"               element={<NgoHistory />} />
            <Route path="/ngo/request/:id"           element={<RequestDetail />} />
            <Route path="/ngo/request/:id/assign"    element={<AssignVolunteer />} />
            <Route path="/ngo/request/:id/verify"    element={<PickupVerify />} />
            <Route path="/ngo/notifications"         element={<Notifications />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
