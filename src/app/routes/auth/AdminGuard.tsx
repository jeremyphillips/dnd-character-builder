import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { useActiveCampaign } from '../../providers/ActiveCampaignProvider'
import { ROUTES } from '../../routes'
import { apiFetch } from '../../api'
import { useState, useEffect } from 'react'

type CampaignWithAdmin = { _id: string; adminId?: string }

export default function AdminGuard() {
  const { user } = useAuth()
  const { activeCampaignId } = useActiveCampaign()
  const [isCampaignOwner, setIsCampaignOwner] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user || !activeCampaignId) {
      setIsCampaignOwner(false)
      setChecking(false)
      return
    }
    apiFetch<{ campaign?: CampaignWithAdmin }>(`/api/campaigns/${activeCampaignId}`)
      .then((data) => {
        const adminId = data.campaign?.adminId
        setIsCampaignOwner(String(adminId) === user.id)
      })
      .catch(() => setIsCampaignOwner(false))
      .finally(() => setChecking(false))
  }, [user, activeCampaignId])

  const canAccess = user?.role === 'superadmin' || isCampaignOwner

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (checking) return null
  if (!canAccess) return <Navigate to={ROUTES.DASHBOARD} replace />

  return <Outlet />
}
