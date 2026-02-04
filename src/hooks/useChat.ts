import { useCallback, useState } from 'react';
import { sendChatMessage, type ChatMessage } from '@/services/chat.service'

type UseChatReturn = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  resetChat: () => void
};

export default function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
        // send only the latest user message to backend
        const assistantMessage = await sendChatMessage(userMessage.content)

        setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
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
