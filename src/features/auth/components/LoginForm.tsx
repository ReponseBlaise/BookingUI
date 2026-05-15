import { useState, type ChangeEvent, type FormEvent } from 'react'

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/15"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-2 focus:ring-[#ff4d2d]/15"
        />
      </div>

      <button type="submit" className="w-full rounded-2xl bg-[#ff4d2d] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,77,45,0.2)] transition hover:bg-[#ff5b3f]">
        Log in
      </button>
    </form>
  )
}
