import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Mail, Lock } from 'lucide-react'
import { login as loginApi } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Login() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await loginApi(form)
      loginUser(res.token, res.user)
      navigate(res.user.role === 'DONOR' ? '/donor' : '/ngo')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-forest-600 rounded-2xl mb-4 shadow-md">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to FoodRescue AI</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input type="email" required value={form.email} onChange={set('email')}
                  className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input type="password" required value={form.password} onChange={set('password')}
                  className="input pl-10" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
