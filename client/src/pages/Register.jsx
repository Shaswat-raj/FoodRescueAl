import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { register as registerApi } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/Spinner.jsx'

const ROLES = [
  { value: 'DONOR', label: 'Food Donor', desc: 'I have food to donate' },
  { value: 'NGO',   label: 'NGO / Charity', desc: 'We collect and distribute food' },
]

export default function Register() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    role: '', name: '', email: '', password: '',
    phone: '', address: '', organization: '', pickupCapacity: '',
    coordinates: { lat: '', lng: '' },
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setCoord = k => e => setForm(f => ({ ...f, coordinates: { ...f.coordinates, [k]: e.target.value } }))

  const geoLocate = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm(f => ({ ...f, coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude } }))
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const payload = {
        ...form,
        coordinates: { lat: parseFloat(form.coordinates.lat), lng: parseFloat(form.coordinates.lng) },
        pickupCapacity: form.pickupCapacity ? parseInt(form.pickupCapacity) : 0,
      }
      const res = await registerApi(payload)
      loginUser(res.token, res.user)
      navigate(res.user.role === 'DONOR' ? '/donor' : '/ngo')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-forest-600 rounded-2xl mb-4 shadow-md">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Join FoodRescue AI today</p>
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="section-title mb-4">I am a…</h2>
            <div className="grid grid-cols-2 gap-4">
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  onClick={() => { setForm(f => ({ ...f, role: r.value })); setStep(2) }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:border-forest-400 ${
                    form.role === r.value ? 'border-forest-500 bg-forest-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{r.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{r.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-forest-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <button onClick={() => setStep(1)} className="text-sm text-forest-600 hover:underline mb-4 inline-block">← Back</button>
            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input required value={form.name} onChange={set('name')} className="input" placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input required value={form.phone} onChange={set('phone')} className="input" placeholder="+1 555 0100" />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" required value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" required minLength={8} value={form.password} onChange={set('password')} className="input" placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="label">Address</label>
                <input required value={form.address} onChange={set('address')} className="input" placeholder="123 Main St, City" />
              </div>
              {form.role === 'NGO' && (
                <>
                  <div>
                    <label className="label">Organization Name</label>
                    <input required value={form.organization} onChange={set('organization')} className="input" placeholder="Helping Hands NGO" />
                  </div>
                  <div>
                    <label className="label">Pickup Capacity (servings/day, 0 = unlimited)</label>
                    <input type="number" min="0" value={form.pickupCapacity} onChange={set('pickupCapacity')} className="input" placeholder="0" />
                  </div>
                </>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Coordinates</label>
                  <button type="button" onClick={geoLocate} className="text-xs text-forest-600 hover:underline">Use my location</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="any" required value={form.coordinates.lat} onChange={setCoord('lat')} className="input" placeholder="Latitude" />
                  <input type="number" step="any" required value={form.coordinates.lng} onChange={setCoord('lng')} className="input" placeholder="Longitude" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Used for NGO matching. Click "Use my location" for auto-fill.</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? <Spinner size="sm" /> : 'Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
