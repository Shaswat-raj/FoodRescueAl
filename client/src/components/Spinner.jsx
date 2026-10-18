export default function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'
  return (
    <span className={`inline-block ${s} border-2 border-forest-300 border-t-forest-600 rounded-full animate-spin ${className}`} />
  )
}
