import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import { getNotifications } from '../api/notifications.js'

export default function AppLayout() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetch = () =>
      getNotifications().then(r => setUnread(r.unreadCount || 0)).catch(() => {})
    fetch()
    const id = setInterval(fetch, 30000) // poll every 30s
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar unread={unread} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet context={{ setUnread }} />
        </div>
      </main>
    </div>
  )
}
