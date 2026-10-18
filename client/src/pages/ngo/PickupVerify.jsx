import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyPickup } from '../../api/donations.js'
import Spinner from '../../components/Spinner.jsx'
import { ArrowLeft, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function PickupVerify() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await verifyPickup(id, otp)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-forest-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pickup Complete!</h1>
          <p className="text-gray-500 mb-8">The donation has been marked as completed. Thank you for making a difference!</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/ngo')} className="btn-primary btn-lg">Back to Dashboard</button>
            <button onClick={() => navigate('/ngo/requests')} className="btn-secondary">View All Requests</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6"><ArrowLeft size={16} /> Back</button>

      <div className="card">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <KeyRound size={24} className="text-purple-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verify Pickup</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the 6-digit OTP provided by the donor</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-2">
            <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-center block">One-Time Password</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input text-center text-3xl font-bold tracking-[0.4em] font-mono py-4"
              placeholder="000000"
            />
          </div>
          <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary btn-lg w-full">
            {loading ? <Spinner size="sm" /> : 'Verify & Complete Pickup'}
          </button>
        </form>

        <div className="mt-4 bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 text-center">Max 5 attempts. OTP valid for 4 hours from assignment.</p>
        </div>
      </div>
    </div>
  )
}
