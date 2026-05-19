import { useState } from 'react'
import { useThreads, useThreadMessages, useSendMessage } from '../hooks/useMessages'

export default function MessagesPanel() {
  const { data: threads = [] } = useThreads()
  const [active, setActive] = useState<string | undefined>(threads[0]?.threadId)
  const { data: messages = [] } = useThreadMessages(active)
  const send = useSendMessage()
  const [text, setText] = useState('')

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 rounded-lg border bg-white p-3">
        <h3 className="mb-2 font-bold">Conversations</h3>
        <ul className="space-y-2">
          {threads.map((t: any) => (
            <li key={t.threadId ?? t.id} className={`cursor-pointer rounded p-2 ${active === t.threadId ? 'bg-slate-100' : ''}`} onClick={() => setActive(t.threadId)}>
              <div className="text-sm font-semibold">{t.senderId === localStorage.getItem('authUser') ? t.receiverId : t.senderId}</div>
              <div className="text-xs text-slate-500 truncate">{t.content}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-2 rounded-lg border bg-white p-3">
        <h3 className="mb-2 font-bold">Messages</h3>
        <div className="mb-3 h-64 overflow-auto border p-2">
          {messages.map((m: any) => (
            <div key={m.id} className={`mb-2 ${m.senderId === localStorage.getItem('authUser') ? 'text-right' : ''}`}>
              <div className="inline-block rounded px-3 py-1 text-sm" style={{ background: m.senderId === localStorage.getItem('authUser') ? '#dcfce7' : '#f3f4f6' }}>{m.content}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 rounded border p-2" value={text} onChange={e => setText(e.target.value)} />
          <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={async () => { await send.mutateAsync({ threadId: active, content: text }); setText('') }}>Send</button>
        </div>
      </div>
    </div>
  )
}
