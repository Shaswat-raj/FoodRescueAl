import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const icons = {
  success: <CheckCircle size={18} className="text-green-600" />,
  error:   <XCircle    size={18} className="text-red-600"   />,
  info:    <Info       size={18} className="text-blue-600"  />,
}

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 min-w-[280px] max-w-sm animate-fade-in"
        >
          {icons[t.type]}
          <span className="text-sm text-gray-800 flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
