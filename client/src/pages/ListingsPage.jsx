import { useState, useEffect } from 'react'
import { getListings, claimListing } from '../services/listings.js'
import ListingCard from '../components/ListingCard.jsx'
import toast from 'react-hot-toast'

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getListings({ status: 'available' })
      .then(data => setListings(data.data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleClaim = async (id) => {
    try {
      await claimListing(id)
      toast.success('Listing claimed!')
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'claimed' } : l))
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading listings...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Food</h1>
      {listings.length === 0 ? (
        <p className="text-gray-400 text-sm">No listings available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} onClaim={handleClaim} />
          ))}
        </div>
      )}
    </div>
  )
}
