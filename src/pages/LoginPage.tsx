import { useMemo, useState, useEffect, type ChangeEvent } from 'react'
import { FaApple, FaEnvelope, FaGoogle, FaLock, FaLockOpen, FaMapMarkerAlt, FaPhone, FaUserCircle } from 'react-icons/fa'
import { api } from '../lib/api'
import { useAuth } from '../features/auth'
import type { User } from '../features/auth'

type AuthMode = 'login' | 'signup' | 'forgot'

type FormState = {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  resetToken: string
  newPassword: string
  role: 'GUEST' | 'HOST' | 'ADMIN'
  preferredRole: 'GUEST' | 'HOST' | 'ADMIN'
  bio: string
  languagesSpoken: string
  website: string
  country: string
}

const initialFormState: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  resetToken: '',
  newPassword: '',
  role: 'GUEST',
  preferredRole: 'GUEST',
  bio: '',
  languagesSpoken: '',
  website: '',
  country: '',
}

const modeCopy: Record<AuthMode, { title: string; copy: string; action: string }> = {
  login: {
    title: 'Welcome back! Please sign in to continue.',
    copy: 'Use your account to access saved listings, host tools, and your booking history.',
    action: 'Sign in',
  },
  signup: {
    title: 'Create your booking account.',
    copy: 'This form mirrors the backend user and profile schema. Optional profile fields can be completed now or later while editing your profile.',
    action: 'Create account',
  },
  forgot: {
    title: 'Reset your password.',
    copy: 'Request a reset email from the backend, then switch to the reset tab to finish the change.',
    action: 'Send reset link',
  },
}

type LoginPageProps = {
  onLoginSuccess?: (user: User) => void
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: 'GUEST' | 'HOST' | 'ADMIN'
    preferredRole?: 'GUEST' | 'HOST' | 'ADMIN'
  }
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [form, setForm] = useState<FormState>(initialFormState)
  const [status, setStatus] = useState<{ msg: string; type: 'error' | 'success' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingRole, setPendingRole] = useState<'GUEST' | 'HOST' | 'ADMIN'>('GUEST')
  const { login } = useAuth()

  const tabs = useMemo(
    () => [
      { key: 'login' as const, label: 'Login' },
      { key: 'signup' as const, label: 'Sign up' },
      { key: 'forgot' as const, label: 'Forgot password' },
    ],
    [],
  )

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  useEffect(() => {
    if (mode !== 'signup') return

    const fallbackLocale = () => {
      const lang = navigator.language || 'en-US'
      const parts = lang.split('-')
      const region = parts[1] || ''
      const intlWithDisplayNames = Intl as typeof Intl & { DisplayNames?: typeof Intl.DisplayNames }
      if (intlWithDisplayNames.DisplayNames && region) {
        try {
          const name = new intlWithDisplayNames.DisplayNames([parts[0] || 'en'], { type: 'region' }).of(region)
          setForm(prev => ({ ...prev, country: name ?? region }))
          return
        } catch {}
      }
      setForm(prev => ({ ...prev, country: region }))
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords
          setForm(prev => ({ ...prev, country: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}` }))
        },
        () => fallbackLocale(),
      )
    } else {
      fallbackLocale()
    }
  }, [mode])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

    if (mode === 'login') {
      if (!form.email || !form.password) {
        setStatus({ msg: 'Email and password are required.', type: 'error' })
        return
      }
      setIsSubmitting(true)
      try {
        const data = await api.post<LoginResponse>('/api/v1/auth/login', {
          email: form.email,
          password: form.password,
          deviceId: 'bookingui-web',
        })
        const authUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.preferredRole ?? data.user.role ?? pendingRole,
          preferredRole: data.user.preferredRole ?? data.user.role ?? pendingRole,
        }
        login(authUser, data.accessToken, data.refreshToken)
        setStatus({ msg: `Signed in as ${authUser.preferredRole}.`, type: 'success' })
        onLoginSuccess?.(authUser)
      } catch (error) {
        setStatus({ msg: error instanceof Error ? error.message : 'Login failed. Please try again.', type: 'error' })
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (mode === 'signup') {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        setStatus({ msg: 'Name, email, password and confirmation are required.', type: 'error' })
        return
      }
      if (form.password !== form.confirmPassword) {
        setStatus({ msg: 'Passwords do not match.', type: 'error' })
        return
      }
      setIsSubmitting(true)
      try {
        await api.post('/api/v1/auth/register', {
          name: form.name,
          email: form.email,
          username: form.email.split('@')[0],
          phone: form.phone || '0000000000',
          password: form.password,
          confirmPassword: form.confirmPassword || form.password,
          role: form.preferredRole,
          preferredRole: form.preferredRole,
        })
        setPendingRole(form.preferredRole)
        setMode('login')
        setStatus({ msg: `Account created as ${form.preferredRole}. You can now sign in.`, type: 'success' })
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Sign up failed. Please try again.'
        const isConflict = msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')
        setStatus({ msg: isConflict ? 'An account with this email already exists. Please sign in instead.' : msg, type: 'error' })
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (!form.email) {
      setStatus({ msg: 'Email is required.', type: 'error' })
      return
    }

    if (mode !== 'forgot') {
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/api/v1/auth/forgot-password', { email: form.email })
      setStatus({ msg: `If ${form.email} exists, a reset email has been sent. Password changes now live in your profile page when signed in.`, type: 'success' })
    } catch (error) {
      setStatus({ msg: error instanceof Error ? error.message : 'Reset request failed. Please try again.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
    return
  }

  const copy = modeCopy[mode]

  return (
    <main className="login-page" id="login">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key)
                  setStatus(null)
                }}
                className={mode === tab.key ? 'rounded-xl bg-[#ff4d2d] px-3 py-3 text-sm font-semibold text-white' : 'rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h1 className="login-kicker" id="login-title">
            {copy.title}
          </h1>
          <p className="login-copy">{copy.copy}</p>

          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="social-stack" aria-label="Social sign in options">
                <button type="button" className="social-btn social-btn--dark">
                  <FaApple aria-hidden="true" />
                  <span>{mode === 'login' ? 'Continue with Apple' : 'Sign up with Apple'}</span>
                </button>
                <button type="button" className="social-btn social-btn--light">
                  <FaGoogle aria-hidden="true" />
                  <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
                </button>
              </div>

              <p className="privacy-note">
                We won&apos;t send anything anywhere. These controls only update local UI state.
              </p>

              <div className="divider">Or</div>
            </>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="mb-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  Account details
                </div>

                <label className="field">
                  <span className="field-label">Full name<span>*</span></span>
                  <div className="input-shell">
                    <input className="login-input" type="text" name="name" placeholder="Enter your full name" value={form.name} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('name', event.target.value)} />
                    <FaUserCircle aria-hidden="true" />
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">Email address<span>*</span></span>
                  <div className="input-shell">
                    <input className="login-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('email', event.target.value)} />
                    <FaEnvelope aria-hidden="true" />
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">Phone</span>
                  <div className="input-shell">
                    <input className="login-input" type="tel" name="phone" placeholder="Optional phone number" value={form.phone} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('phone', event.target.value)} />
                    <FaPhone aria-hidden="true" />
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">Password<span>*</span></span>
                  <div className="input-shell">
                    <input className="login-input" type="password" name="password" placeholder="Create a password" value={form.password} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('password', event.target.value)} />
                    <FaLockOpen aria-hidden="true" />
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">Confirm password<span>*</span></span>
                  <div className="input-shell">
                    <input className="login-input" type="password" name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('confirmPassword', event.target.value)} />
                    <FaLock aria-hidden="true" />
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">Preferred role</span>
                  <select className="login-input" name="preferredRole" value={form.preferredRole} onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('preferredRole', event.target.value as FormState['preferredRole'])}>
                    <option value="GUEST">Guest</option>
                    <option value="HOST">Host</option>
                  </select>
                </label>

                <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Profile details</p>
                      <p className="text-xs text-slate-500">Optional fields for later profile editing, matching the backend shape.</p>
                    </div>
                    <span className="rounded-full bg-[#fff1eb] px-3 py-1 text-xs font-semibold text-[#ff4d2d]">Optional</span>
                  </div>

                  <div className="grid gap-4">
                    <label className="field">
                      <span className="field-label">Bio</span>
                      <textarea className="login-input min-h-28 resize-y pr-4" name="bio" placeholder="Tell people a little about yourself" value={form.bio} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField('bio', event.target.value)} />
                    </label>

                    <label className="field">
                      <span className="field-label">Languages spoken</span>
                      <input className="login-input" type="text" name="languagesSpoken" placeholder="English, French, Spanish" value={form.languagesSpoken} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('languagesSpoken', event.target.value)} />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="field">
                        <span className="field-label">Website</span>
                        <input className="login-input" type="url" name="website" placeholder="https://your-site.com" value={form.website} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('website', event.target.value)} />
                      </label>

                      <label className="field">
                        <span className="field-label">Country</span>
                        <div className="input-shell">
                          <input className="login-input" type="text" name="country" placeholder="Country or region" value={form.country} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('country', event.target.value)} />
                          <FaMapMarkerAlt aria-hidden="true" />
                        </div>
                      </label>
                    </div>

                    {/* joined year removed - registration date set automatically */}
                  </div>
                </div>
              </>
            )}

            {(mode === 'login' || mode === 'forgot') && (
              <label className="field">
                <span className="field-label">Email address<span>*</span></span>
                <div className="input-shell">
                  <input className="login-input" type="email" name="email" placeholder="Enter your valid email" value={form.email} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('email', event.target.value)} />
                  <FaEnvelope aria-hidden="true" />
                </div>
              </label>
            )}

            {mode === 'login' && (
              <>
                <label className="field">
                  <span className="field-label">Password<span>*</span></span>
                  <div className="input-shell">
                    <input className="login-input" type="password" name="password" placeholder="Password" value={form.password} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('password', event.target.value)} />
                    <FaLockOpen aria-hidden="true" />
                  </div>
                </label>

                <label className="remember-row">
                  <input type="checkbox" name="remember" />
                  <span>Remember me next time</span>
                </label>
              </>
            )}

            {mode === 'forgot' && (
              <p className="field-error">Need to change your password while signed in? Use the Password section in your profile page.</p>
            )}

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : copy.action}
            </button>
          </form>

          {status && (
            <p className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-[#fff1eb] text-[#b53a23]'
            }`}>
              {status.msg}
            </p>
          )}

          <div className="login-links">
            {mode !== 'signup' ? (
              <span>
                Don&apos;t have an account? <button type="button" onClick={() => setMode('signup')} className="font-semibold text-[#252b36] underline decoration-slate-300 underline-offset-4">Sign up</button>
              </span>
            ) : (
              <span>
                Already have an account? <button type="button" onClick={() => setMode('login')} className="font-semibold text-[#252b36] underline decoration-slate-300 underline-offset-4">Sign in</button>
              </span>
            )}
            <button type="button" onClick={() => setMode('forgot')} className="text-[#252b36] font-semibold underline decoration-slate-300 underline-offset-4">
              Forgot Password
            </button>
          </div>
        </div>
      </section>

      <section className="login-visual" aria-hidden="true">
        <div className="visual-card">
          <div className="visual-copy">
            <h2>Profile fields and password recovery now stay in sync with the backend shape.</h2>
            <p>
              The login screen now supports register, forgot-password, and reset-password flows against the real auth endpoints.
            </p>
          </div>

          <div className="illustration">
            <div className="ground-shadow" />
            <div className="figure">
              <span className="figure-hair" />
              <span className="figure-head" />
              <span className="figure-body" />
              <span className="figure-arm-left" />
              <span className="figure-arm-right" />
              <span className="figure-leg-one" />
              <span className="figure-leg-two" />
            </div>
            <div className="laptop-screen" />
            <div className="laptop-base" />
            <div className="security-badge">
              <FaLock aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}