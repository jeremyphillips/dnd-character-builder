import type { ChatMessage } from '../types'

export async function sendChatMessage(prompt: string): Promise<ChatMessage> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ prompt })
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Failed to send chat message: ${res.status}`)
  }

  const data = await res.json()
  return { role: 'assistant', content: data.reply }
}
