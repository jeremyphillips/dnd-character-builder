import { useAuth } from '../../providers/AuthProvider'
import { MessagingLayout } from '@/features/messaging'

export default function MessagingRoute() {
  useAuth()
  return <MessagingLayout />
}
