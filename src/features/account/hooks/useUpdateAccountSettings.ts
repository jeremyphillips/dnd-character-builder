import { useState } from 'react'
import { apiFetch } from '@/app/api'
import type { AccountSettings } from './useAccountSettings'

export function useUpdateAccountSettings() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (data: AccountSettings) => {
    setError(null)
    setSuccess(false)

    try {
      await apiFetch('/api/auth/me', {
        method: 'PATCH',
        body: data,
      })
      setSuccess(true)
    } catch {
      setError('Failed to save account settings')
    }
  }

  return { update, success, error }
}
