import { MapPin, Clock, Package } from 'lucide-react'

const statusStyles = {
  available: 'bg-green-100 text-green-700',
  claimed:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  expired:   'bg-red-100 text-red-600',
}

export default function ListingCard({ listing, onClaim }) {
  const { title, description, quantity, unit, location, status, expiresAt } = listing

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[status]}`}>
          {status}
        </span>
      </div>

      {description && (
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Package size={14} />
          {quantity} {unit}
        </span>
        {location?.address && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {location.address}
          </span>
        )}
        {expiresAt && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {new Date(expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {status === 'available' && onClaim && (
        <button
          onClick={() => onClaim(listing._id)}
          className="mt-1 w-full py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          Claim Food
        </button>
      )}
    </div>
  )
}
