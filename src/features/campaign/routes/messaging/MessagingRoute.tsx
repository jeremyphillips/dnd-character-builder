import { useAuth } from '@/app/providers/AuthProvider'
import { MessagingLayout } from '@/features/messaging/components'

export default function MessagingRoute() {
  useAuth()
  return <MessagingLayout />
}
