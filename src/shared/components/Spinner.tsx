export function Spinner() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="Loading">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff4d2d]" />
    </div>
  )
}
