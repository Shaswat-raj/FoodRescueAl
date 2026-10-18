import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Leaf, LayoutDashboard, List, PlusCircle, User, LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/listings',     label: 'Listings',      icon: List },
  { to: '/listings/new', label: 'Donate Food',   icon: PlusCircle },
  { to: '/profile',      label: 'Profile',       icon: User },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <Leaf className="text-brand-600" size={22} />
          <span className="font-bold text-lg text-brand-700">FoodRescue AI</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1 truncate">{user?.email}</div>
          <span className="inline-block text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
