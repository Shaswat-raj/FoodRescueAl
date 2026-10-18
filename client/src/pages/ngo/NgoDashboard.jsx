import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyDonations, getAvailable } from '../../api/donations.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import Spinner from '../../components/Spinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { Inbox, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}

export default function NgoDashboard() {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAvailable(), getMyDonations()])
      .then(([avail, mine]) => {
        setPending(avail.data || [])
        setAll(mine.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const active    = all.filter(d => ['ACCEPTED','ASSIGNED','PICKUP_IN_PROGRESS'].includes(d.status))
  const completed = all.filter(d => d.status === 'COMPLETED')

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">NGO Dashboard</h1>
        <p className="text-gray-500 mt-1">{user?.organization || user?.name} · Managing food pickups</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={Inbox}        label="Pending Requests" value={pending.length}    color="bg-amber-500" />
        <StatCard icon={Clock}        label="Active"           value={active.length}     color="bg-blue-500"  />
        <StatCard icon={CheckCircle2} label="Completed"        value={completed.length}  color="bg-forest-600"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <>
          {/* Pending requests */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" />
                Pending Requests
                {pending.length > 0 && <span className="badge bg-amber-100 text-amber-700">{pending.length}</span>}
              </h2>
              <Link to="/ngo/requests" className="text-sm text-forest-600 hover:underline font-medium">View all</Link>
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No pending requests</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {pending.slice(0,3).map(d => (
                  <Link key={d._id} to={`/ngo/request/${d._id}`}
                    className="flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{d.foodName}</div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {d.quantity} {d.unit} · by {fmtDate(d.safeUseBy)}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-forest-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active pickups */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Active Pickups</h2>
              <Link to="/ngo/history" className="text-sm text-forest-600 hover:underline font-medium">Full history</Link>
            </div>
            {active.length === 0 ? (
              <EmptyState title="No active pickups" message="Accept a request to get started." />
            ) : (
              <div className="space-y-3">
                {active.map(d => (
                  <Link key={d._id} to={`/ngo/request/${d._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-forest-50 transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{d.foodName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{d.donor?.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.status} />
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-forest-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const fmtDate = d => new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
