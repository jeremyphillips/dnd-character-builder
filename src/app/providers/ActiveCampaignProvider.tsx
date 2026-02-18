import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'  
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import { apiFetch } from '../api'
import type { Campaign } from '@/shared/types/campaign.types'
import { editions, settings } from '@/data'
import { getNameById } from '@/domain/lookups'

interface ActiveCampaignContextType {
  campaign: Campaign | null,
  campaignId: string | null,
  campaignName: string | null,
  settingId: string | null,
  settingName: string | null,
  editionId: string | null,
  editionName: string | null,
  loading: boolean,
  setActiveCampaign: (id: string) => void
  clearActiveCampaign: () => void
}

const ActiveCampaignContext =
  createContext<ActiveCampaignContextType | undefined>(undefined)

const STORAGE_KEY = 'activeCampaignId'

function isValidObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id)
}

export const ActiveCampaignProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)

  const [campaignId, setActiveCampaignId] =
    useState<string | null>(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored && isValidObjectId(stored) ? stored : null
    })

  // Auto-select when user has only one campaign
  useEffect(() => {
    console.log("CampaignProvider autoselect");
    apiFetch<{ campaigns: { _id: string }[] }>('/api/campaigns')
      .then((data) => {
        const list = data.campaigns ?? []
        if (list.length !== 1) return
        setActiveCampaignId((prev) => {
          if (prev) return prev
          const id = list[0]._id
          localStorage.setItem(STORAGE_KEY, id)
          return id
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    console.log("CampaignProvider match");
    const match = matchPath(
      { path: '/campaigns/:campaignId/*' },
      location.pathname
    )

    if (match?.params?.campaignId) {
      const id = match.params.campaignId
      if (id) {
        if (isValidObjectId(id) && id !== campaignId) {
          setActiveCampaignId(id)
          localStorage.setItem(STORAGE_KEY, id)
        } else if (!isValidObjectId(id) && campaignId === id) {
          setActiveCampaignId(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  }, [location.pathname, campaignId])

  // Stable callback so consumers don't re-render when the provider re-renders
  const setActiveCampaign = useCallback((id: string) => {
    setActiveCampaignId(id)
    localStorage.setItem(STORAGE_KEY, id)
    navigate(`/campaigns/${id}`)
  }, [navigate])

  // Stable callback — clear stored campaign without navigation
  const clearActiveCampaign = useCallback(() => {
    setActiveCampaignId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    console.log("CampaignProvider fetch");
    if (!campaignId) {
      setCampaign(null)
      return
    }

    // Abort stale request on cleanup (prevents duplicate fetches in StrictMode)
    const controller = new AbortController()
  
    setLoading(true)
  
    apiFetch<{ campaign: Campaign }>(`/api/campaigns/${campaignId}`, { signal: controller.signal })
      .then((data) => {
        setCampaign(data.campaign ?? null)
      })
      .catch(() => {
        if (!controller.signal.aborted) setCampaign(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [campaignId])
  
  
  // Memoize context value so consumers only re-render when campaign state changes
  const value = useMemo(() => ({
    campaignId,
    campaign,
    campaignName: campaign?.identity?.name ?? null,
    settingId: campaign?.identity?.setting ?? null,
    settingName: campaign?.identity?.setting ? getNameById(settings, campaign.identity.setting) : null,
    editionId: campaign?.identity?.edition ?? null,
    editionName: campaign?.identity?.edition ? getNameById(editions, campaign.identity.edition): null,
    loading,
    setActiveCampaign,
    clearActiveCampaign
  }), [campaignId, campaign, loading, setActiveCampaign, clearActiveCampaign])


  return (
    <ActiveCampaignContext.Provider value={value}>
      {children}
    </ActiveCampaignContext.Provider>
  )
}

export const useActiveCampaign = () => {
  const context = useContext(ActiveCampaignContext)
  if (!context) {
    throw new Error(
      'useActiveCampaign must be used within ActiveCampaignProvider'
    )
  }
  return context
}
