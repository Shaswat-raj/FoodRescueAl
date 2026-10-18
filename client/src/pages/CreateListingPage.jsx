import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../services/listings.js'
import toast from 'react-hot-toast'

const UNITS = ['kg', 'lbs', 'servings', 'items', 'boxes', 'trays']

export default function CreateListingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'kg',
    expiresAt: '',
    address: '',
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createListing({
        ...form,
        quantity: Number(form.quantity),
        location: { address: form.address },
      })
      toast.success('Listing created!')
      navigate('/listings')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Donate Food</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            required value={form.title} onChange={set('title')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Leftover sandwiches from event"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3} value={form.description} onChange={set('description')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Food type, condition, packaging, etc."
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number" min="1" required value={form.quantity} onChange={set('quantity')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select value={form.unit} onChange={set('unit')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
          <input
            required value={form.address} onChange={set('address')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="123 Main St, City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
          <input
            type="datetime-local" required value={form.expiresAt} onChange={set('expiresAt')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-2 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Submitting...' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}
