import { useCallback, useState } from 'react'
import { sendChatMessage } from '../services/chat.service'
import type { ChatMessage } from '../types'

type UseChatReturn = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<ChatMessage | null>
  resetChat: () => void
}

export default function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string): Promise<ChatMessage | null> => {
    const userMessage: ChatMessage = { role: 'user', content }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const assistantMessage = await sendChatMessage(userMessage.content)
      setMessages(prev => [...prev, assistantMessage])
      return assistantMessage
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat
  }
}
