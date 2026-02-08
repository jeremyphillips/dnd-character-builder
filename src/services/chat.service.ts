export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const PORT = 5001

export async function sendChatMessage(prompt: string): Promise<ChatMessage> {
  const res = await fetch(`http://localhost:${PORT}/api/chat`, {
		method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })

  if (!res.ok) {
    throw new Error(`Failed to send chat message: ${res.status}`)
  }

  const data = await res.json();
  return { role: 'assistant', content: data.reply }
}


