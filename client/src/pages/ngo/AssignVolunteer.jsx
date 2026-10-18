import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assignVolunteer } from '../../api/donations.js'
import Spinner from '../../components/Spinner.jsx'
import { ArrowLeft, User, Hash, Phone, Key, AlertTriangle } from 'lucide-react'

export default function AssignVolunteer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', idRef: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await assignVolunteer(id, { volunteer: form })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-lg">
        <div className="card text-center">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key size={28} className="text-forest-600" />
          </div>
          <h1 className="page-title mb-2">Volunteer Assigned!</h1>
          <p className="text-gray-500 mb-6">Share this OTP with the donor. The donor will provide it to the volunteer at pickup.</p>

          <div className="bg-forest-50 border-2 border-forest-200 rounded-2xl p-6 mb-4">
            <p className="text-sm text-forest-600 font-medium mb-2">One-Time Pickup Code</p>
            <p className="text-5xl font-bold tracking-[0.3em] text-forest-700 font-mono">{result.otp}</p>
            <p className="text-xs text-forest-500 mt-3">Expires: {new Date(result.assignment.otpExpiry).toLocaleString()}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-left mb-6">
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">This OTP is shown only once. In production it would be delivered via SMS/email. Note it down now.</p>
          </div>

          <button onClick={() => navigate(`/ngo/request/${id}`)} className="btn-primary w-full">
            Back to Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6"><ArrowLeft size={16} /> Back</button>
      <h1 className="page-title mb-2">Assign Volunteer</h1>
      <p className="text-gray-500 mb-6">Enter the volunteer's details. An OTP will be generated for pickup verification.</p>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Volunteer Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input required value={form.name} onChange={set('name')} className="input pl-10" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="label">Volunteer ID / Reference</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input required value={form.idRef} onChange={set('idRef')} className="input pl-10" placeholder="VOL-2024-001" />
            </div>
          </div>
          <div>
            <label className="label">Volunteer Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input required value={form.phone} onChange={set('phone')} className="input pl-10" placeholder="+1 555 0100" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? <Spinner size="sm" /> : 'Assign & Generate OTP'}
          </button>
        </form>
      </div>
    </div>
  )
}
