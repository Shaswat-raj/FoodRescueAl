import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyDonations } from '../../api/donations.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Spinner from '../../components/Spinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { ChevronRight } from 'lucide-react'

export default function DonationHistory() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    getMyDonations().then(r => setDonations(r.data || [])).finally(() => setLoading(false))
  }, [])

  const statuses = ['ALL','REQUESTED','ACCEPTED','ASSIGNED','PICKUP_IN_PROGRESS','COMPLETED','REJECTED','CANCELLED']
  const filtered = filter === 'ALL' ? donations : donations.filter(d => d.status === filter)

  return (
    <div>
      <h1 className="page-title mb-6">My Donations</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === s ? 'bg-forest-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >{s === 'ALL' ? 'All' : s.replace(/_/g,' ')}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No donations found" message="Try a different filter or donate food." />
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <Link key={d._id} to={`/donor/donation/${d._id}`}
              className="card hover:shadow-card-hover transition-shadow flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-900">{d.foodName}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="text-sm text-gray-500">
                  {d.quantity} {d.unit} · {d.category.replace('_',' ')} · {fmtDate(d.createdAt)}
                </div>
                {d.assignedNgo && (
                  <div className="text-sm text-gray-400 mt-0.5">NGO: {d.assignedNgo.organization || d.assignedNgo.name}</div>
                )}
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-forest-500 transition-colors ml-4" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
