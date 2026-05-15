import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f6f5f1] px-4 py-12">
      <div className="max-w-lg rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff4d2d]">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">The page you requested does not exist. Return home to continue browsing listings.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-[#ff4d2d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.2)]">
          Back to home
        </Link>
      </div>
    </main>
  )
}
