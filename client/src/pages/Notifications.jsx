import { useState, useEffect } from 'react'
import { getNotifications, markRead, markAllRead } from '../api/notifications.js'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Bell, BellRing, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const TYPE_COLORS = {
  REQUEST_RECEIVED: 'bg-blue-100 text-blue-600',
  ACCEPTED:         'bg-teal-100 text-teal-600',
  REJECTED:         'bg-red-100 text-red-600',
  ASSIGNED:         'bg-purple-100 text-purple-600',
  PICKUP_STARTED:   'bg-orange-100 text-orange-600',
  COMPLETED:        'bg-forest-100 text-forest-600',
  CANCELLED:        'bg-gray-100 text-gray-500',
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    getNotifications().then(r => setNotifs(r.data || [])).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleRead = async (id) => {
    await markRead(id)
    setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x))
  }

  const handleReadAll = async () => {
    await markAllRead()
    setNotifs(n => n.map(x => ({ ...x, read: true })))
  }

  const unread = notifs.filter(n => !n.read).length
  const detailPath = (n) => {
    if (!n.donation) return null
    return user?.role === 'DONOR'
      ? `/donor/donation/${n.donation._id || n.donation}`
      : `/ngo/request/${n.donation._id || n.donation}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unread > 0 && <p className="text-gray-400 text-sm mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={handleReadAll} className="btn-ghost text-sm">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : notifs.length === 0 ? (
        <EmptyState title="All caught up!" message="No notifications yet." />
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const path = detailPath(n)
            const Wrapper = path ? Link : 'div'
            return (
              <Wrapper
                key={n._id}
                to={path}
                onClick={() => !n.read && handleRead(n._id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-gray-100 hover:bg-gray-50'
                    : 'bg-forest-50 border-forest-200 hover:bg-forest-100'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-500'}`}>
                  {n.read ? <Bell size={16} /> : <BellRing size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmtDate(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-forest-500 mt-1.5 flex-shrink-0" />}
              </Wrapper>
            )
          })}
        </div>
      )}
    </div>
  )
}

const fmtDate = d => new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
