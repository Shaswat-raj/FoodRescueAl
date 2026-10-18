import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Leaf, LayoutDashboard, PlusCircle, List,
  Bell, LogOut, Building2, CheckSquare, ClipboardList,
} from 'lucide-react'

const donorLinks = [
  { to: '/donor',         label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/donor/donate',  label: 'Donate Food', icon: PlusCircle      },
  { to: '/donor/history', label: 'My Donations',icon: List            },
]
const ngoLinks = [
  { to: '/ngo',           label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/ngo/requests',  label: 'Requests',    icon: ClipboardList   },
  { to: '/ngo/history',   label: 'History',     icon: CheckSquare     },
]

export default function Sidebar({ unread = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'DONOR' ? donorLinks : ngoLinks
  const notifPath = user?.role === 'DONOR' ? '/donor/notifications' : '/ngo/notifications'

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-forest-600 rounded-xl flex items-center justify-center">
          <Leaf size={16} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-base">FoodRescue AI</span>
      </div>

      {/* Role chip */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {user?.role === 'DONOR'
            ? <Leaf size={14} className="text-forest-600" />
            : <Building2 size={14} className="text-purple-600" />}
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            user?.role === 'DONOR' ? 'text-forest-600' : 'text-purple-600'
          }`}>{user?.role}</span>
        </div>
        <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{user?.name}</p>
        {user?.organization && <p className="text-xs text-gray-400 truncate">{user.organization}</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/donor' || to === '/ngo'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-forest-50 text-forest-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <NavLink to={notifPath}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-forest-50 text-forest-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <div className="relative">
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          Notifications
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
