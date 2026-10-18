import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome back, <span className="font-medium text-gray-700">{user?.name}</span> 👋
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Active Listings',  value: '—', color: 'bg-brand-50  text-brand-700' },
          { label: 'Total Donations',  value: '—', color: 'bg-blue-50   text-blue-700' },
          { label: 'Meals Rescued',    value: '—', color: 'bg-orange-50 text-orange-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-6 ${stat.color}`}>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Activity</h2>
        <p className="text-sm text-gray-400">No activity yet. Start by donating food or claiming a listing.</p>
      </div>
    </div>
  )
}
