import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDonation, acceptDonation, rejectDonation } from '../../api/donations.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Spinner from '../../components/Spinner.jsx'
import { ArrowLeft, User, MapPin, Clock, Package, CheckCircle2, XCircle, UserPlus } from 'lucide-react'

export default function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    getDonation(id).then(r => { setData(r.data); setAssignment(r.assignment) }).finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handle = async (fn, label) => {
    if (!confirm(`${label} this request?`)) return
    setActioning(true); setError('')
    try { await fn(id); load() } catch (err) { setError(err.message) } finally { setActioning(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data)   return <div className="text-center py-20 text-gray-400">Not found</div>

  const donor = data.donor

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6"><ArrowLeft size={16} /> Back</button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">{data.foodName}</h1>
          <p className="text-gray-500 mt-1">{data.quantity} {data.unit} · {data.category.replace('_',' ')}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Donor info */}
      <div className="card mb-4">
        <h2 className="section-title mb-3">Donor Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Name',    donor?.name],
            ['Phone',   donor?.phone],
            ['Email',   donor?.email],
            ['Address', donor?.address],
          ].map(([k,v]) => (
            <div key={k}>
              <dt className="text-gray-400">{k}</dt>
              <dd className="font-medium text-gray-900">{v || '—'}</dd>
            </div>
          ))}
        </div>
      </div>

      {/* Food details */}
      <div className="card mb-4">
        <h2 className="section-title mb-3">Food Details</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Quantity',    `${data.quantity} ${data.unit}`],
            ['Category',    data.category.replace('_',' ')],
            ['Prepared At', fmtDate(data.preparedAt)],
            ['Safe Use By', fmtDate(data.safeUseBy)],
            ['Storage',     data.storageConditions || '—'],
            ['Pickup Addr', data.pickupAddress],
          ].map(([k,v]) => (
            <div key={k}>
              <dt className="text-gray-400">{k}</dt>
              <dd className="font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {data.notes && <p className="mt-3 text-sm bg-gray-50 rounded-xl px-3 py-2 text-gray-500">{data.notes}</p>}
      </div>

      {/* Volunteer */}
      {assignment?.volunteer && (
        <div className="card mb-4">
          <h2 className="section-title mb-3">Assigned Volunteer</h2>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-gray-400">Name</dt><dd className="font-medium">{assignment.volunteer.name}</dd></div>
            <div><dt className="text-gray-400">ID Ref</dt><dd className="font-medium">{assignment.volunteer.idRef}</dd></div>
            <div><dt className="text-gray-400">Phone</dt><dd className="font-medium">{assignment.volunteer.phone}</dd></div>
          </dl>
          {assignment.otpExpiry && (
            <p className="text-xs text-gray-400 mt-2">OTP expires: {new Date(assignment.otpExpiry).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {data.status === 'REQUESTED' && (
          <div className="flex gap-3">
            <button onClick={() => handle(rejectDonation, 'Reject')} disabled={actioning}
              className="btn-danger flex-1">
              {actioning ? <Spinner size="sm" /> : <><XCircle size={16} />Reject</>}
            </button>
            <button onClick={() => handle(acceptDonation, 'Accept')} disabled={actioning}
              className="btn-primary flex-1">
              {actioning ? <Spinner size="sm" /> : <><CheckCircle2 size={16} />Accept</>}
            </button>
          </div>
        )}

        {data.status === 'ACCEPTED' && (
          <Link to={`/ngo/request/${id}/assign`} className="btn-primary w-full flex items-center justify-center gap-2">
            <UserPlus size={16} /> Assign Volunteer
          </Link>
        )}

        {data.status === 'ASSIGNED' && (
          <Link to={`/ngo/request/${id}/verify`} className="btn-primary w-full flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Verify Pickup OTP
          </Link>
        )}
      </div>
    </div>
  )
}

const fmtDate = d => d ? new Date(d).toLocaleString() : '—'
