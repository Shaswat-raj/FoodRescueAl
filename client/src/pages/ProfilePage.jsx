import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        {[
          { label: 'Name',  value: user?.name },
          { label: 'Email', value: user?.email },
          { label: 'Role',  value: user?.role },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</div>
            <div className="text-gray-800 mt-0.5 capitalize">{value || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
