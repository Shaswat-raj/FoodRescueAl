import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Inbox size={48} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
      {message && <p className="text-sm text-gray-400 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
