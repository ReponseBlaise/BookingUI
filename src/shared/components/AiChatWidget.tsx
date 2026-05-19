import { useEffect, useMemo, useState } from 'react'
import { FaComments, FaPaperPlane } from 'react-icons/fa'
import { api } from '../../lib/api'

type AiChatWidgetProps = {
  role: 'GUEST' | 'HOST' | 'ADMIN'
  currentView: string
  onBrowseListings: () => void
  onOpenDashboard: () => void
  onOpenBookings: () => void
  onOpenHostDashboard: () => void
}

type Message = {
  sender: 'assistant' | 'user'
  text: string
}

const CHAT_SESSION_KEY = 'bookingui-ai-session'

export function AiChatWidget({ role, currentView, onBrowseListings, onOpenDashboard, onOpenBookings, onOpenHostDashboard }: AiChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem(CHAT_SESSION_KEY)
    const nextSessionId = storedSessionId || crypto.randomUUID()
    window.localStorage.setItem(CHAT_SESSION_KEY, nextSessionId)
    setSessionId(nextSessionId)
  }, [])

  const contextMessage = useMemo(() => {
    if (role === 'HOST') return 'I can help you manage listings, bookings, and host actions.'
    if (role === 'ADMIN') return 'I can help you review moderation, platform stats, and booking activity.'
    return 'I can help you find stays, check bookings, and review saved listings.'
  }, [role])

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed || !sessionId || isSending) return

    setOpen(true)
    setIsSending(true)
    setMessages(current => [...current, { sender: 'user', text: trimmed }])
    setInput('')

    void api
      .post<{ reply?: string | { content?: string }; sessionId?: string }>(`/api/v1/ai/chat`, {
        message: trimmed,
        sessionId,
        role,
        currentView,
      })
      .then(response => {
        const replyText =
          typeof response.reply === 'string'
            ? response.reply
            : response.reply?.content ?? 'The AI assistant did not return a response.'

        setMessages(current => [...current, { sender: 'assistant', text: replyText }])
      })
      .catch(() => {
        setMessages(current => [...current, { sender: 'assistant', text: replyFor(trimmed, role, currentView) }])
      })
      .finally(() => {
        setIsSending(false)
      })
  }

  return (
    <div className={`assistant-dock ${open ? 'assistant-dock--open' : ''}`}>
      {open && (
        <div className="assistant-panel">
          <div className="assistant-panel__header">
            <div>
              <p className="assistant-panel__eyebrow">AI concierge</p>
              <h3>Travel helper</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)}>Close</button>
          </div>

          <p className="assistant-panel__context">{contextMessage}</p>

          <div className="assistant-panel__actions">
            <button type="button" onClick={onBrowseListings}>Browse stays</button>
            <button type="button" onClick={onOpenDashboard}>Dashboard</button>
            <button type="button" onClick={onOpenBookings}>Bookings</button>
            {role === 'HOST' && <button type="button" onClick={onOpenHostDashboard}>Host tools</button>}
          </div>

          <div className="assistant-panel__messages">
            {messages.length === 0 ? (
              <div className="assistant-panel__empty">Ask about booking tips, host tools, or where to go next.</div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.sender}-${index}`} className={`assistant-message assistant-message--${message.sender}`}>
                  {message.text}
                </div>
              ))
            )}
          </div>

          <div className="assistant-panel__composer">
            <input
              type="text"
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="Ask the assistant..."
            />
            <button type="button" onClick={sendMessage} aria-label="Send message" disabled={isSending}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      <button type="button" className="assistant-toggle" onClick={() => setOpen(current => !current)}>
        <FaComments />
        <span>AI chat</span>
      </button>
    </div>
  )
}

function replyFor(text: string, role: 'GUEST' | 'HOST' | 'ADMIN', currentView: string) {
  const lower = text.toLowerCase()

  if (lower.includes('book')) return 'You can open your bookings or jump to a listing and start a new reservation.'
  if (lower.includes('host')) return 'Hosts can manage listings from the dashboard and open the host workspace for approvals.'
  if (lower.includes('admin')) return 'Admins can review moderation queues and all bookings from the dashboard.'
  if (lower.includes('map') || lower.includes('location')) return 'The explore view and listing detail pages are designed to show destination context and map previews.'
  if (currentView === 'login') return 'Finish signing in and the dashboard will open with your role-specific tools.'

  return role === 'GUEST'
    ? 'Try browsing stays, checking bookings, or opening the dashboard for your saved listings.'
    : role === 'HOST'
      ? 'Use host tools to create listings, edit inventory, and review booking requests.'
      : 'Use moderation and booking views to keep the platform organized.'
}
