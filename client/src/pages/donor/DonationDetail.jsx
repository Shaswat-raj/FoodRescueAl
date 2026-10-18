import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDonation, cancelDonation } from '../../api/donations.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Spinner from '../../components/Spinner.jsx'
import { ArrowLeft, MapPin, Clock, User, Building2, Package, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

const TIMELINE = [
  { status: 'REQUESTED',          label: 'Request Submitted',     desc: 'Waiting for NGO to accept' },
  { status: 'ACCEPTED',           label: 'NGO Accepted',          desc: 'NGO confirmed, assigning volunteer' },
  { status: 'ASSIGNED',           label: 'Volunteer Assigned',    desc: 'Volunteer is on the way. Share OTP when they arrive.' },
  { status: 'PICKUP_IN_PROGRESS', label: 'Pickup In Progress',    desc: 'OTP verified, completing pickup' },
  { status: 'COMPLETED',          label: 'Donation Completed',    desc: 'Food successfully rescued! 🎉' },
]
const ORDER = TIMELINE.map(t => t.status)

export default function DonationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    getDonation(id).then(r => { setData(r.data); setAssignment(r.assignment) }).finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this donation request?')) return
    setCancelling(true)
    try {
      await cancelDonation(id)
      load()
    } catch (err) { setError(err.message) } finally { setCancelling(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return <div className="text-center py-20 text-gray-400">Donation not found</div>

  const currentIdx = ORDER.indexOf(data.status)
  const isTerminal = ['COMPLETED','REJECTED','CANCELLED'].includes(data.status)

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">{data.foodName}</h1>
          <p className="text-gray-500 mt-1">{data.quantity} {data.unit} · {data.category.replace('_',' ')}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* OTP notice for donor */}
      {data.status === 'ASSIGNED' && assignment && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-purple-800 text-sm">Volunteer is assigned</p>
            <p className="text-sm text-purple-700 mt-0.5">When the volunteer arrives, they will ask for the OTP. Check your notifications for the OTP code.</p>
            <p className="text-xs text-purple-500 mt-1">OTP expires: {new Date(assignment.otpExpiry).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {!['REJECTED','CANCELLED'].includes(data.status) && (
        <div className="card mb-6">
          <h2 className="section-title mb-5">Donation Progress</h2>
          <div className="space-y-0">
            {TIMELINE.map((step, i) => {
              const done = i < currentIdx || data.status === 'COMPLETED'
              const active = data.status === step.status
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      done ? 'bg-forest-500' : active ? 'bg-forest-600 ring-4 ring-forest-100' : 'bg-gray-200'
                    }`}>
                      {done
                        ? <CheckCircle2 size={16} className="text-white" />
                        : <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-white' : 'bg-gray-400'}`} />
                      }
                    </div>
                    {i < TIMELINE.length - 1 && <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-forest-400' : 'bg-gray-200'}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium text-sm ${active || done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    {(active || done) && <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Food details */}
      <div className="card mb-4">
        <h2 className="section-title mb-4">Food Details</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Food Name',   data.foodName],
            ['Category',    data.category.replace('_',' ')],
            ['Quantity',    `${data.quantity} ${data.unit}`],
            ['Prepared At', fmtDate(data.preparedAt)],
            ['Safe Use By', fmtDate(data.safeUseBy)],
            ['Storage',     data.storageConditions || 'Not specified'],
          ].map(([k,v]) => (
            <div key={k}>
              <dt className="text-gray-400">{k}</dt>
              <dd className="font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {data.notes && <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{data.notes}</p>}
      </div>

      {/* NGO details */}
      {data.assignedNgo && (
        <div className="card mb-4">
          <h2 className="section-title mb-3">Assigned NGO</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Building2 size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{data.assignedNgo.organization || data.assignedNgo.name}</p>
              <p className="text-sm text-gray-400">{data.assignedNgo.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer */}
      {assignment?.volunteer && (
        <div className="card mb-4">
          <h2 className="section-title mb-3">Volunteer Details</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-gray-400">Name</dt><dd className="font-medium">{assignment.volunteer.name}</dd></div>
            <div><dt className="text-gray-400">ID Ref</dt><dd className="font-medium">{assignment.volunteer.idRef}</dd></div>
            <div><dt className="text-gray-400">Phone</dt><dd className="font-medium">{assignment.volunteer.phone}</dd></div>
          </div>
        </div>
      )}

      {/* Cancel button */}
      {data.status === 'REQUESTED' && (
        <button onClick={handleCancel} disabled={cancelling} className="btn-danger w-full">
          {cancelling ? <Spinner size="sm" /> : <><XCircle size={16} />Cancel Donation</>}
        </button>
      )}

      {/* Terminal states */}
      {data.status === 'REJECTED' && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-700 font-medium text-sm">This donation was declined by the NGO.</p>
        </div>
      )}
      {data.status === 'CANCELLED' && (
        <div className="card bg-gray-50 border-gray-200">
          <p className="text-gray-500 font-medium text-sm">You cancelled this donation request.</p>
        </div>
      )}
    </div>
  )
}

const fmtDate = d => d ? new Date(d).toLocaleString() : '—'
