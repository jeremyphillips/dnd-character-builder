import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { apiFetch } from '@/app/api'
import { ROUTES } from '@/app/routes'
import type { RegisterFormData, RegisterResponse, PendingRedirect } from './register.types'

export function useRegister() {
  const { refreshUser } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [redirectAfterAuth, setRedirectAfterAuth] = useState<PendingRedirect | null>(null)

  async function register(data: RegisterFormData) {
    setError('')
    setSubmitting(true)

    try {
      const res = await apiFetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: data,
      })

      // Compute redirect target from the registration response.
      const redirect: PendingRedirect = res.campaignId
        ? {
            to: `${ROUTES.NEW_CHARACTER}?campaignId=${res.campaignId}`,
            state: {
              campaignName: res.campaignName,
              campaignEdition: res.campaignEdition,
              campaignSetting: res.campaignSetting,
            },
          }
        : { to: ROUTES.NEW_CHARACTER }

      // Store redirect in state so it survives across re-renders.
      // When refreshUser() triggers a re-render with user != null,
      // the consuming component can read redirectAfterAuth to navigate.
      setRedirectAfterAuth(redirect)

      await refreshUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    register,
    error,
    submitting,
    redirectAfterAuth,
  }
}
