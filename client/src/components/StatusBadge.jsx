const configs = {
  REQUESTED:          { label: 'Requested',         cls: 'bg-blue-100 text-blue-700'   },
  ACCEPTED:           { label: 'Accepted',           cls: 'bg-teal-100 text-teal-700'   },
  ASSIGNED:           { label: 'Volunteer Assigned', cls: 'bg-purple-100 text-purple-700'},
  PICKUP_IN_PROGRESS: { label: 'Pickup In Progress', cls: 'bg-orange-100 text-orange-700'},
  COMPLETED:          { label: 'Completed',          cls: 'bg-forest-100 text-forest-700'},
  REJECTED:           { label: 'Rejected',           cls: 'bg-red-100 text-red-700'     },
  CANCELLED:          { label: 'Cancelled',          cls: 'bg-gray-100 text-gray-500'   },
}

export default function StatusBadge({ status }) {
  const { label, cls } = configs[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`badge ${cls}`}>{label}</span>
}
