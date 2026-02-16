import { useEffect, useState } from 'react'
import { apiFetch } from '@/app/api'

export type NotificationPreferences = {
  sessionScheduled: boolean
  inviteReceived: boolean
  mentionedInChat: boolean
}

export type AccountSettings = {
  firstName: string
  lastName: string
  username: string
  avatarKey: string | null
  bio: string
  website: string
  email: string
  notificationPreferences: NotificationPreferences
}

type MeResponse = {
  user: {
    id: string
    username?: string
    email?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
    bio?: string
    website?: string
    notificationPreferences?: Partial<NotificationPreferences>
  } | null
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  sessionScheduled: true,
  inviteReceived: true,
  mentionedInChat: true,
}

export function useAccountSettings() {
  const [data, setData] = useState<AccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    apiFetch<MeResponse>('/api/auth/me')
      .then((res) => {
        const u = res.user
        if (!u) {
          setError('Not authenticated')
          return
        }
        setData({
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          username: u.username ?? '',
          avatarKey: u.avatarUrl ?? null,
          bio: u.bio ?? '',
          website: u.website ?? '',
          email: u.email ?? '',
          notificationPreferences: {
            ...DEFAULT_NOTIFICATION_PREFS,
            ...u.notificationPreferences,
          },
        })
      })
      .catch(() => setError('Failed to load account settings'))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
