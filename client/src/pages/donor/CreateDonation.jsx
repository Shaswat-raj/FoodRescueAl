import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getNearbyNgos } from '../../api/ngos.js'
import { createDonation } from '../../api/donations.js'
import Spinner from '../../components/Spinner.jsx'
import { MapPin, Clock, CheckCircle2, Building2, AlertTriangle, Info } from 'lucide-react'

const CATEGORIES = [
  { value: 'cooked_meal',  label: 'Cooked Meal' },
  { value: 'raw_produce',  label: 'Raw Produce' },
  { value: 'bakery',       label: 'Bakery' },
  { value: 'dairy',        label: 'Dairy' },
  { value: 'packaged',     label: 'Packaged Food' },
  { value: 'beverages',    label: 'Beverages' },
  { value: 'other',        label: 'Other' },
]
const UNITS = ['kg','litres','servings','items','boxes']

const steps = ['Food Details', 'Pickup Info', 'Select NGO', 'Confirm']

export default function CreateDonation() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ngos, setNgos] = useState([])
  const [ngosLoading, setNgosLoading] = useState(false)
  const [selectedNgo, setSelectedNgo] = useState(null)

  const [form, setForm] = useState({
    foodName: '', category: '', quantity: '', unit: 'kg',
    preparedAt: '', safeUseBy: '', storageConditions: '', notes: '',
    pickupAddress: user?.address || '',
    pickupCoordinates: { lat: user?.coordinates?.lat || '', lng: user?.coordinates?.lng || '' },
  })

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setC = k => e => setForm(f => ({ ...f, pickupCoordinates: { ...f.pickupCoordinates, [k]: e.target.value } }))

  const fetchNgos = async () => {
    setNgosLoading(true); setError('')
    try {
      const res = await getNearbyNgos({
        lat: form.pickupCoordinates.lat,
        lng: form.pickupCoordinates.lng,
        deadline: form.safeUseBy,
        category: form.category,
      })
      setNgos(res.data || [])
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setNgosLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const res = await createDonation({
        ...form,
        quantity: Number(form.quantity),
        pickupCoordinates: {
          lat: parseFloat(form.pickupCoordinates.lat),
          lng: parseFloat(form.pickupCoordinates.lng),
        },
        assignedNgoId: selectedNgo.ngo._id,
      })
      navigate(`/donor/donation/${res.data._id}`)
    } catch (err) {
      setError(err.message)
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="page-title mb-2">Donate Food</h1>
      <p className="text-gray-500 mb-8">Fill in the details and we'll match you with a nearby NGO</p>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < step ? 'bg-forest-600 text-white' : i === step ? 'bg-forest-600 text-white ring-4 ring-forest-100' : 'bg-gray-200 text-gray-400'
            }`}>{i < step ? '✓' : i + 1}</div>
            <div className="flex-1 mx-2">
              <div className={`h-0.5 ${i < step ? 'bg-forest-500' : 'bg-gray-200'}`} />
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Step 0 — Food Details */}
      {step === 0 && (
        <div className="card space-y-4">
          <h2 className="section-title">Food Information</h2>
          <div>
            <label className="label">Food Name</label>
            <input value={form.foodName} onChange={set('foodName')} className="input" placeholder="e.g. Vegetable biryani" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={set('category')} className="input">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Quantity</label>
                <input type="number" min="1" value={form.quantity} onChange={set('quantity')} className="input" placeholder="10" />
              </div>
              <div>
                <label className="label">Unit</label>
                <select value={form.unit} onChange={set('unit')} className="input">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prepared At</label>
              <input type="datetime-local" value={form.preparedAt} onChange={set('preparedAt')} className="input" />
            </div>
            <div>
              <label className="label">Safe Use By</label>
              <input type="datetime-local" value={form.safeUseBy} onChange={set('safeUseBy')} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Storage Conditions</label>
            <input value={form.storageConditions} onChange={set('storageConditions')} className="input" placeholder="e.g. Keep refrigerated" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} className="input resize-none" placeholder="Any additional info…" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">Food safety eligibility is time-based only and estimated — human judgment is required before actual pickup. Do not donate food that is already unsafe.</p>
          </div>
          <button
            onClick={() => { setError(''); setStep(1) }}
            disabled={!form.foodName || !form.category || !form.quantity || !form.preparedAt || !form.safeUseBy}
            className="btn-primary w-full"
          >Next: Pickup Info</button>
        </div>
      )}

      {/* Step 1 — Pickup Info */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="section-title">Pickup Location</h2>
          <div>
            <label className="label">Pickup Address</label>
            <input value={form.pickupAddress} onChange={set('pickupAddress')} className="input" placeholder="123 Main St, City" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input type="number" step="any" value={form.pickupCoordinates.lat} onChange={setC('lat')} className="input" placeholder="e.g. 28.6139" />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input type="number" step="any" value={form.pickupCoordinates.lng} onChange={setC('lng')} className="input" placeholder="e.g. 77.2090" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">Coordinates are used to find nearby NGOs. Your registered coordinates are pre-filled.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
            <button
              onClick={fetchNgos}
              disabled={ngosLoading || !form.pickupAddress || !form.pickupCoordinates.lat || !form.pickupCoordinates.lng}
              className="btn-primary flex-1"
            >
              {ngosLoading ? <Spinner size="sm" /> : 'Find Nearby NGOs →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Select NGO */}
      {step === 2 && (
        <div className="card">
          <h2 className="section-title mb-1">Recommended NGOs</h2>
          <p className="text-sm text-gray-400 mb-4">Ranked by proximity and capacity. Estimates include a 30-min safety buffer.</p>

          {ngos.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">😔</div>
              <h3 className="font-semibold text-gray-700">No eligible NGOs found</h3>
              <p className="text-sm text-gray-400 mt-1">Try extending the safe-use deadline or check your location.</p>
              <button onClick={() => setStep(1)} className="btn-secondary mt-4">Back</button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {ngos.map((item, i) => (
                  <button key={item.ngo._id} type="button"
                    onClick={() => item.eligible && setSelectedNgo(item)}
                    disabled={!item.eligible}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      !item.eligible
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        : selectedNgo?.ngo._id === item.ngo._id
                          ? 'border-forest-500 bg-forest-50'
                          : 'border-gray-200 bg-white hover:border-forest-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 size={15} className="text-gray-400" />
                          <span className="font-semibold text-gray-900">{item.ngo.organization || item.ngo.name}</span>
                          {i === 0 && item.eligible && <span className="badge bg-forest-100 text-forest-700">Best match</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={13} />{item.distanceKm} km</span>
                          <span className="flex items-center gap-1"><Clock size={13} />~{item.estimatedPickupMins} min</span>
                        </div>
                      </div>
                      {item.eligible
                        ? selectedNgo?.ngo._id === item.ngo._id
                          ? <CheckCircle2 size={20} className="text-forest-600" />
                          : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        : <span className="text-xs text-red-500 font-medium">Not feasible</span>
                      }
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{item.reason}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} disabled={!selectedNgo} className="btn-primary flex-1">
                  Review & Submit →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && selectedNgo && (
        <div className="card space-y-5">
          <h2 className="section-title">Confirm Donation</h2>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            {[
              ['Food', form.foodName],
              ['Category', form.category.replace('_',' ')],
              ['Quantity', `${form.quantity} ${form.unit}`],
              ['Safe Use By', new Date(form.safeUseBy).toLocaleString()],
              ['Pickup Address', form.pickupAddress],
              ['Assigned NGO', selectedNgo.ngo.organization || selectedNgo.ngo.name],
              ['Distance', `${selectedNgo.distanceKm} km (~${selectedNgo.estimatedPickupMins} min)`],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900 text-right max-w-xs">{v}</span>
              </div>
            ))}
          </div>
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? <Spinner size="sm" /> : 'Submit Donation Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
