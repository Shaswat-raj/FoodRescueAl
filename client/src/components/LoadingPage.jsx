import Spinner from './Spinner.jsx'

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream-100">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  )
}
