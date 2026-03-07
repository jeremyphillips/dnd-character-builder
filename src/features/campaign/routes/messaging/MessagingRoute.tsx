import { useAuth } from '@/app/providers/AuthProvider'
import { MessagingLayout } from '@/features/messaging/MessagingLayout'

export default function MessagingRoute() {
  useAuth()
  return <MessagingLayout />
}
