import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  const [campaignId, setActiveCampaignId] =
    useState<string | null>(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored && isValidObjectId(stored) ? stored : null
    })

  // Start loading as true when a campaignId is already known (from localStorage
  // or URL sync) so consumers see a loading state instead of a brief flash of
  // "Campaign not found" before the fetch effect fires.
  const [loading, setLoading] = useState(() => !!campaignId)

  // Auto-select when user has only one campaign.
  // AbortController prevents StrictMode from completing both duplicate fetches.
  useEffect(() => {
    const controller = new AbortController()
    apiFetch<{ campaigns: { _id: string }[] }>('/api/campaigns', { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
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
    return () => controller.abort()
  }, [])

  useEffect(() => {
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

  // Hold navigate in a ref so setActiveCampaign never changes identity.
  // React Router v7's useNavigate() may return a new function when the router
  // context updates; putting it in useCallback deps would cascade a new context
  // value to every consumer on each location change.
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const setActiveCampaign = useCallback((id: string) => {
    setActiveCampaignId(id)
    localStorage.setItem(STORAGE_KEY, id)
    navigateRef.current(`/campaigns/${id}`)
  }, [])

  // Stable callback — clear stored campaign without navigation
  const clearActiveCampaign = useCallback(() => {
    setActiveCampaignId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (!campaignId) {
      setCampaign(null)
      return
    }

    // Abort stale request on cleanup (prevents duplicate fetches in StrictMode)
    const controller = new AbortController()

    setLoading(true)

    apiFetch<{ campaign: Campaign }>(`/api/campaigns/${campaignId}`, { signal: controller.signal })
      .then((data) => {
        // Guard: on fast localhost the response may arrive before StrictMode's
        // cleanup abort fires, so check the signal before applying state.
        if (!controller.signal.aborted) setCampaign(data.campaign ?? null)
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
