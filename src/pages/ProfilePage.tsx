import { useRef, useState } from 'react'
import { FaCamera, FaCheckCircle } from 'react-icons/fa'
import { api } from '../lib/api'
import { useAuth } from '../features/auth'

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, deleteAvatar } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
      })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setPasswordBusy(true)
    try {
      await api.post('/api/v1/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' })
      console.error(error)
    } finally {
      setPasswordBusy(false)
    }
  }

  const openAvatarPicker = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarBusy(true)
    try {
      await uploadAvatar(file)
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload avatar' })
    } finally {
      e.target.value = ''
      setAvatarBusy(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user?.avatar) return
    setAvatarBusy(true)
    try {
      await deleteAvatar()
      setMessage({ type: 'success', text: 'Avatar removed successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to remove avatar' })
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header with cover image */}
      <div className="relative h-32 overflow-hidden bg-linear-to-r from-[#ff4d2d] to-orange-400">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <button
          type="button"
          onClick={openAvatarPicker}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition"
        >
          <FaCamera className="text-[#ff4d2d]" />
          {avatarBusy ? 'Uploading...' : 'Upload avatar'}
        </button>
      </div>

      {/* Profile info section */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 mb-8">
          <div className="flex items-end gap-6">
            <div className="relative h-32 w-32">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user?.name ?? 'User'} avatar`}
                  className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="h-full w-full rounded-full border-4 border-white bg-linear-to-br from-[#ff4d2d] to-[#ff6b4d] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user?.name?.[0]?.toUpperCase() ?? 'N'}
                </div>
              )}
              <button
                type="button"
                onClick={openAvatarPicker}
                disabled={avatarBusy}
                className="absolute bottom-0 right-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#ff4d2d] text-white hover:bg-[#ff3f1f] transition"
              >
                <FaCamera />
              </button>
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-slate-900">{user?.name ?? 'User'}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📍 San Francisco, US</span>
                {user?.joinedYear && <span>✓ Joined {user.joinedYear}</span>}
              </div>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={avatarBusy}
                  className="mt-3 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  {avatarBusy ? 'Please wait...' : 'Remove avatar'}
                </button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center gap-2">
              <FaCheckCircle />
              {message.text}
            </div>
          </div>
        )}

        {/* Details Section */}
        <form onSubmit={handleSaveProfile} className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Details</h2>
          </div>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-[#ff4d2d] focus:outline-none"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-[#ff4d2d] focus:outline-none"
                  placeholder="(123) 456 - 789"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#ff4d2d] px-6 py-2 text-white font-medium hover:bg-[#ff3f1f] disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
          </div>
          <div className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-[#ff4d2d] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-[#ff4d2d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-[#ff4d2d] focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="submit"
              disabled={passwordBusy}
              className="rounded-lg bg-[#ff4d2d] px-6 py-2 text-white font-medium hover:bg-[#ff3f1f] disabled:opacity-50 transition"
            >
              {passwordBusy ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
