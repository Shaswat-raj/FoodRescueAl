import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Package, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react'
import { getMyDonations } from '../../api/donations.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import Spinner from '../../components/Spinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const STATUS_ORDER = ['REQUESTED','ACCEPTED','ASSIGNED','PICKUP_IN_PROGRESS','COMPLETED','REJECTED','CANCELLED']

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

export default function DonorDashboard() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDonations().then(r => setDonations(r.data || [])).finally(() => setLoading(false))
  }, [])

  const counts = {
    active:    donations.filter(d => ['REQUESTED','ACCEPTED','ASSIGNED','PICKUP_IN_PROGRESS'].includes(d.status)).length,
    completed: donations.filter(d => d.status === 'COMPLETED').length,
    pending:   donations.filter(d => d.status === 'REQUESTED').length,
    rejected:  donations.filter(d => d.status === 'REJECTED').length,
  }

  const recent = [...donations].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Good {greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your food donations</p>
        </div>
        <Link to="/donor/donate" className="btn-primary btn-lg">
          <PlusCircle size={18} /> Donate Food
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package}     label="Active"    value={counts.active}    color="bg-blue-500" />
        <StatCard icon={CheckCircle2}label="Completed" value={counts.completed} color="bg-forest-600" />
        <StatCard icon={Clock}       label="Pending"   value={counts.pending}   color="bg-amber-500" />
        <StatCard icon={XCircle}     label="Rejected"  value={counts.rejected}  color="bg-red-500" />
      </div>

      {/* Recent donations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Donations</h2>
          <Link to="/donor/history" className="text-sm text-forest-600 hover:underline font-medium">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : recent.length === 0 ? (
          <EmptyState
            title="No donations yet"
            message="Start by donating surplus food to nearby NGOs."
            action={<Link to="/donor/donate" className="btn-primary">Donate Food</Link>}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(d => (
              <Link key={d._id} to={`/donor/donation/${d._id}`}
                className="flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">{d.foodName}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{d.quantity} {d.unit} · {d.category.replace('_',' ')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.status} />
                  <span className="text-xs text-gray-400">{fmtDate(d.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}
const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
